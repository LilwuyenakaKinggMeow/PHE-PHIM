
const express = require("express");
const crypto = require("crypto");
const pool = require("../config/db");
const redisClient = require("../config/redis");

const router = express.Router();

const HOLD_SECONDS = 300;

// POST /api/seats/hold
router.post("/hold", async (req, res) => {
    const { showtimeId, seatCode } = req.body || {};

    if (
        !Number.isSafeInteger(showtimeId) ||
        showtimeId <= 0 ||
        typeof seatCode !== "string" ||
        !/^[A-J](10|[1-9])$/.test(seatCode)
    ) {
        return res.status(400).json({
            success: false,
            message: "Du lieu suat chieu hoac ghe khong hop le"
        });
    }

    const key = `seat:hold:${showtimeId}:${seatCode}`;
    const holdToken = crypto.randomUUID();

    try {
        // Kiem tra suat chieu va ghe
        const seatResult = await pool.query(
            `SELECT s.id
             FROM seats s
             JOIN showtimes st
               ON st.room_name = s.room_name
             WHERE st.id = $1
               AND s.seat_code = $2`,
            [showtimeId, seatCode]
        );

        if (seatResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Khong tim thay ghe hoac suat chieu"
            });
        }

        // Kiem tra ghe da duoc ban
        const sold = await pool.query(
            `SELECT 1
             FROM booking_seats
             WHERE showtime_id = $1
               AND seat_id = $2
               AND status = 'confirmed'
             LIMIT 1`,
            [showtimeId, seatResult.rows[0].id]
        );

        if (sold.rowCount > 0) {
            return res.status(409).json({
                success: false,
                message: "Ghe da duoc dat"
            });
        }

        // SET NX: chi mot yeu cau giu duoc ghe
        const locked = await redisClient.set(
            key,
            holdToken,
            { NX: true, EX: HOLD_SECONDS }
        );

        if (locked !== "OK") {
            return res.status(409).json({
                success: false,
                message: "Ghe dang duoc nguoi khac giu"
            });
        }
// Kiem tra lai ghe da ban sau khi tao khoa Redis
const soldAgain = await pool.query(
    `SELECT 1
     FROM booking_seats
     WHERE showtime_id = $1
       AND seat_id = $2
       AND status = 'confirmed'
     LIMIT 1`,
    [showtimeId, seatResult.rows[0].id]
);

if (soldAgain.rowCount > 0) {
    // Chi xoa khoa neu token van thuoc yeu cau nay
    await redisClient.eval(
        `if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
         else
            return 0
         end`,
        {
            keys: [key],
            arguments: [holdToken]
        }
    );

    return res.status(409).json({
        success: false,
        message: "Ghe vua duoc ban, khong the giu"
    });
}
        return res.status(201).json({
            success: true,
            message: "Giu ghe thanh cong",
            showtimeId,
            seatCode,
            holdToken,
            expiresIn: HOLD_SECONDS
        });
    } catch (error) {
        console.error("Seat hold error:", error);

        return res.status(500).json({
            success: false,
            message: "Loi he thong khi giu ghe"
        });
    }
});

// GET /api/seats?showtimeId=1
// Lay trang thai ghe tu PostgreSQL va Redis
router.get("/", async (req, res) => {
    const showtimeId = Number(req.query.showtimeId);

    if (!Number.isSafeInteger(showtimeId) || showtimeId <= 0) {
        return res.status(400).json({
            success: false,
            message: "showtimeId khong hop le"
        });
    }

    try {
        // Lay danh sach ghe thuoc phong cua suat chieu
        // va kiem tra ghe da duoc dat trong PostgreSQL
        const result = await pool.query(
            `SELECT
                s.seat_code,
                EXISTS (
                    SELECT 1
                    FROM booking_seats bs
                    WHERE bs.seat_id = s.id
                      AND bs.showtime_id = $1
                      AND bs.status = 'confirmed'
                ) AS is_sold
             FROM seats s
             JOIN showtimes st
               ON st.room_name = s.room_name
             WHERE st.id = $1
             ORDER BY
               LEFT(s.seat_code, 1),
               CAST(SUBSTRING(s.seat_code FROM 2) AS INTEGER)`,
            [showtimeId]
        );

        // Phan biet suat chieu khong ton tai
        if (result.rowCount === 0) {
            const showtime = await pool.query(
                "SELECT id FROM showtimes WHERE id = $1",
                [showtimeId]
            );

            if (showtime.rowCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Khong tim thay suat chieu"
                });
            }
        }

        const seats = await Promise.all(
            result.rows.map(async (seat) => {
                let status = "available";

                if (seat.is_sold) {
                    status = "sold";
                } else {
                    const key =
                        `seat:hold:${showtimeId}:${seat.seat_code}`;

                    const isHeld = await redisClient.exists(key);

                    if (isHeld) {
                        status = "held";
                    }
                }

                return {
                    seatCode: seat.seat_code,
                    status
                };
            })
        );

        return res.json({
            success: true,
            showtimeId,
            totalSeats: seats.length,
            seats
        });

    } catch (error) {
        console.error("Get seats error:", error);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay danh sach ghe"
        });
    }
});

// POST /api/seats/release
// Huy giu ghe neu token trung khop
router.post("/release", async (req, res) => {
    const { showtimeId, seatCode, holdToken } = req.body || {};

    if (
        !Number.isSafeInteger(showtimeId) ||
        showtimeId <= 0 ||
        typeof seatCode !== "string" ||
        !/^[A-J](10|[1-9])$/.test(seatCode) ||
        typeof holdToken !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(holdToken)
    ) {
        return res.status(400).json({
            success: false,
            message: "Du lieu huy giu ghe khong hop le"
        });
    }

    const key = `seat:hold:${showtimeId}:${seatCode}`;

    try {
        // Chi xoa khoa neu token trung khop
        const released = await redisClient.eval(
            `if redis.call("GET", KEYS[1]) == ARGV[1] then
                return redis.call("DEL", KEYS[1])
             else
                return 0
             end`,
            {
                keys: [key],
                arguments: [holdToken]
            }
        );

        if (released === 0) {
            return res.status(409).json({
                success: false,
                message: "Phien giu ghe khong ton tai hoac da het han"
            });
        }

        return res.json({
            success: true,
            message: "Huy giu ghe thanh cong",
            showtimeId,
            seatCode
        });

    } catch (error) {
        console.error("Release seat error:", error);

        return res.status(500).json({
            success: false,
            message: "Loi he thong khi huy giu ghe"
        });
    }
});

module.exports = router;
