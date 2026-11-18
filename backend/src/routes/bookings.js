
const express = require("express");
const pool = require("../config/db");
const redisClient = require("../config/redis");

const router = express.Router();

const TICKET_PRICE = 75000;

// Chi xoa khoa Redis neu dung token
async function releaseHold(key, token) {
    return redisClient.eval(
        `if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
         else
            return 0
         end`,
        {
            keys: [key],
            arguments: [token]
        }
    );
}

// POST /api/bookings/confirm
router.post("/confirm", async (req, res) => {
    const {
        showtimeId,
        seatCode,
        holdToken,
        customerName,
        paymentResult
    } = req.body || {};

    if (
        !Number.isSafeInteger(showtimeId) ||
        showtimeId <= 0 ||
        typeof seatCode !== "string" ||
        !/^[A-J](10|[1-9])$/.test(seatCode) ||
        typeof holdToken !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(holdToken) ||
        typeof customerName !== "string" ||
        !customerName.trim() ||
        customerName.length > 255 ||
        !["success", "failed"].includes(paymentResult)
    ) {
        return res.status(400).json({
            success: false,
            message: "Du lieu dat ve hoac thanh toan khong hop le"
        });
    }

    const key = `seat:hold:${showtimeId}:${seatCode}`;
    let client;
    let committed = false;

    try {
        // Kiem tra token giu ghe
        const currentToken = await redisClient.get(key);

        if (currentToken !== holdToken) {
            return res.status(409).json({
                success: false,
                message: "Phien giu ghe khong hop le hoac da het han"
            });
        }

        client = await pool.connect();
        await client.query("BEGIN");

        // Tim ghe theo suat chieu
        const seatResult = await client.query(
            `SELECT s.id
             FROM seats s
             JOIN showtimes st
               ON st.room_name = s.room_name
             WHERE st.id = $1
               AND s.seat_code = $2`,
            [showtimeId, seatCode]
        );

        if (seatResult.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Khong tim thay ghe hoac suat chieu"
            });
        }

        const seatId = seatResult.rows[0].id;

        // Khoa ghe trong transaction
        await client.query(
            "SELECT id FROM seats WHERE id = $1 FOR UPDATE",
            [seatId]
        );

        // Kiem tra lai token sau khi khoa
        const tokenAfterLock = await redisClient.get(key);

        if (tokenAfterLock !== holdToken) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Phien giu ghe da het han"
            });
        }

        // Kiem tra ghe da ban
        const existing = await client.query(
            `SELECT 1
             FROM booking_seats
             WHERE showtime_id = $1
               AND seat_id = $2
               AND status = 'confirmed'`,
            [showtimeId, seatId]
        );

        if (existing.rowCount > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                success: false,
                message: "Ghe da duoc ban"
            });
        }

        // Tao don pending
        const bookingResult = await client.query(
            `INSERT INTO bookings
                (showtime_id, customer_name, status)
             VALUES ($1, $2, 'pending')
             RETURNING id`,
            [showtimeId, customerName.trim()]
        );

        const bookingId = bookingResult.rows[0].id;

        // Luu ket qua thanh toan gia lap
        const paymentResultDB = await client.query(
            `INSERT INTO payments
                (booking_id, amount, status)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [bookingId, TICKET_PRICE, paymentResult]
        );

        const paymentId = paymentResultDB.rows[0].id;

        // Thanh toan that bai
        if (paymentResult === "failed") {
            await client.query(
                `UPDATE bookings
                 SET status = 'cancelled'
                 WHERE id = $1`,
                [bookingId]
            );

            await client.query("COMMIT");
            committed = true;

            await releaseHold(key, holdToken).catch(console.error);

            return res.status(402).json({
                success: false,
                message: "Thanh toan gia lap that bai",
                bookingId,
                paymentId,
                paymentStatus: "failed"
            });
        }

        // Thanh toan thanh cong: xac nhan ghe
        await client.query(
            `INSERT INTO booking_seats
                (booking_id, showtime_id, seat_id, status)
             VALUES ($1, $2, $3, 'confirmed')`,
            [bookingId, showtimeId, seatId]
        );

        await client.query(
            `UPDATE bookings
             SET status = 'confirmed'
             WHERE id = $1`,
            [bookingId]
        );

        await client.query("COMMIT");
        committed = true;

        await releaseHold(key, holdToken).catch(console.error);

        return res.status(201).json({
            success: true,
            message: "Thanh toan va dat ve thanh cong",
            bookingId,
            paymentId,
            paymentStatus: "success",
            amount: TICKET_PRICE,
            showtimeId,
            seatCode
        });

    } catch (error) {
        if (client && !committed) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Ghe da duoc dat"
            });
        }

        console.error("Booking/payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Loi he thong khi thanh toan"
        });

    } finally {
        if (client) client.release();
    }
});

module.exports = router;
