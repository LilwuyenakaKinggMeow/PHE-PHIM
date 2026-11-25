
"use strict";

const pool = require("../config/database");
const redisClient = require("../config/redis");

const {
    getSeatLockKey
} = require("../services/seatLockService");

const getSeatsByShowtime = async (req, res) => {
    try {
        const { showtime } = req.query;

        if (!showtime || !Number.isInteger(Number(showtime)) || Number(showtime) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID suất chiếu hợp lệ."
            });
        }

        const showtimeId = Number(showtime);

        const showtimeResult = await pool.query(
            `SELECT id, cinema_id
             FROM showtimes
             WHERE id = $1`,
            [showtimeId]
        );

        if (showtimeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy suất chiếu."
            });
        }

        const cinemaId = showtimeResult.rows[0].cinema_id;

        const result = await pool.query(
            `SELECT
                s.id,
                s.cinema_id,
                s.seat_code,
                s.seat_type,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM booking_seats bs
                        JOIN bookings b ON b.id = bs.booking_id
                        WHERE bs.seat_id = s.id
                          AND b.showtime_id = $1
                          AND b.status = 'confirmed'
                    )
                    THEN 'booked'
                    ELSE 'available'
                END AS status
             FROM seats s
             WHERE s.cinema_id = $2
             ORDER BY
                LEFT(s.seat_code, 1),
                CAST(SUBSTRING(s.seat_code FROM 2) AS INTEGER)`,
            [showtimeId, cinemaId]
        );

        // Đọc trạng thái khóa ghế từ Redis
        const lockKeys = result.rows.map(seat =>
            getSeatLockKey(showtimeId, seat.id)
        );

        const lockValues = lockKeys.length > 0
            ? await redisClient.mGet(lockKeys)
            : [];

        // PostgreSQL xác định ghế đã đặt.
        // Redis xác định ghế đang được giữ tạm thời.
        const seats = result.rows.map((seat, index) => {
            let status = seat.status;

            if (status !== "booked" && lockValues[index]) {
                status = "held";
            }

            return {
                ...seat,
                status
            };
        });

        return res.status(200).json({
            success: true,
            total: seats.length,
            data: seats
        });

    } catch (error) {
        console.error("Get seats error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách ghế."
        });
    }
};

module.exports = { getSeatsByShowtime };
