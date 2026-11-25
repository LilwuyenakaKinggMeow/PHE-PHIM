
"use strict";

const pool = require("../config/database");

const {
    LOCK_TTL,
    generateLockToken,
    acquireSeatLock,
    releaseSeatLock
} = require("../services/seatLockService");

// POST /api/seat-locks
const lockSeats = async (req, res) => {
    const { showtimeId, seatIds } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (
        !Number.isInteger(Number(showtimeId)) ||
        Number(showtimeId) <= 0 ||
        !Array.isArray(seatIds) ||
        seatIds.length === 0 ||
        seatIds.length > 6
    ) {
        return res.status(400).json({
            success: false,
            message: "Thông tin suất chiếu hoặc danh sách ghế không hợp lệ."
        });
    }

    const normalizedSeatIds = seatIds.map(Number);

    if (
        normalizedSeatIds.some(id => !Number.isInteger(id) || id <= 0) ||
        new Set(normalizedSeatIds).size !== normalizedSeatIds.length
    ) {
        return res.status(400).json({
            success: false,
            message: "Danh sách ghế không hợp lệ hoặc bị trùng."
        });
    }

    const id = Number(showtimeId);
    const token = generateLockToken();
    const acquiredSeats = [];

    try {
        // 2. Kiểm tra suất chiếu
        const showtimeResult = await pool.query(
            `SELECT
                id,
                cinema_id,
                (
                    (show_date + start_time)
                    <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')
                ) AS has_started
             FROM showtimes
             WHERE id = $1`,
            [id]
        );

        if (showtimeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy suất chiếu."
            });
        }

        const showtime = showtimeResult.rows[0];

        if (showtime.has_started) {
            return res.status(400).json({
                success: false,
                message: "Suất chiếu đã bắt đầu hoặc đã qua giờ chiếu."
            });
        }

        // 3. Kiểm tra ghế tồn tại và thuộc đúng rạp
        const seatsResult = await pool.query(
            `SELECT id, cinema_id
             FROM seats
             WHERE id = ANY($1::int[])`,
            [normalizedSeatIds]
        );

        if (seatsResult.rows.length !== normalizedSeatIds.length) {
            return res.status(400).json({
                success: false,
                message: "Một hoặc nhiều ghế không tồn tại."
            });
        }

        const invalidSeat = seatsResult.rows.some(
            seat => Number(seat.cinema_id) !== Number(showtime.cinema_id)
        );

        if (invalidSeat) {
            return res.status(400).json({
                success: false,
                message: "Có ghế không thuộc rạp của suất chiếu."
            });
        }

        // 4. Kiểm tra ghế đã được đặt trong PostgreSQL
        const bookedResult = await pool.query(
            `SELECT bs.seat_id
             FROM booking_seats bs
             JOIN bookings b ON b.id = bs.booking_id
             WHERE b.showtime_id = $1
               AND b.status = 'confirmed'
               AND bs.seat_id = ANY($2::int[])`,
            [id, normalizedSeatIds]
        );

        if (bookedResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Một hoặc nhiều ghế đã được đặt.",
                bookedSeatIds: bookedResult.rows.map(row => row.seat_id)
            });
        }

        // 5. Thử khóa lần lượt các ghế trong Redis
        for (const seatId of normalizedSeatIds) {
            const acquired = await acquireSeatLock(id, seatId, token);

            if (!acquired) {
                // Có ghế đang được khách khác giữ
                for (const acquiredSeatId of acquiredSeats) {
                    await releaseSeatLock(id, acquiredSeatId, token);
                }

                return res.status(409).json({
                    success: false,
                    message: "Một hoặc nhiều ghế đang được khách khác giữ.",
                    lockedSeatId: seatId
                });
            }

            acquiredSeats.push(seatId);
        }

        // 6. Kiểm tra lại booking sau khi đã lấy khóa Redis
        const recheckResult = await pool.query(
            `SELECT bs.seat_id
             FROM booking_seats bs
             JOIN bookings b ON b.id = bs.booking_id
             WHERE b.showtime_id = $1
               AND b.status = 'confirmed'
               AND bs.seat_id = ANY($2::int[])`,
            [id, normalizedSeatIds]
        );

        if (recheckResult.rows.length > 0) {
            for (const seatId of acquiredSeats) {
                await releaseSeatLock(id, seatId, token);
            }

            return res.status(409).json({
                success: false,
                message: "Một hoặc nhiều ghế vừa được khách khác đặt.",
                bookedSeatIds: recheckResult.rows.map(row => row.seat_id)
            });
        }

        // 7. Trả kết quả giữ ghế thành công
        return res.status(200).json({
            success: true,
            message: "Giữ ghế thành công.",
            data: {
                showtimeId: id,
                seatIds: acquiredSeats,
                lockToken: token,
                expiresIn: LOCK_TTL / 1000
            }
        });

    } catch (error) {
        // Nếu xảy ra lỗi, giải phóng những ghế đã khóa
        for (const seatId of acquiredSeats) {
            await releaseSeatLock(id, seatId, token).catch(() => {});
        }

        console.error("Lock seats error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Không thể giữ ghế."
        });
    }
};

module.exports = {
    lockSeats
};
