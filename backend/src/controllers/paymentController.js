
"use strict";

const pool = require("../config/database");

const {
    verifySeatLock,
    releaseSeatLock
} = require("../services/seatLockService");

const {
    processSimulatedPayment,
    ALLOWED_METHODS
} = require("../services/paymentService");

// POST /api/payments/:bookingCode
const processPayment = async (req, res) => {
    const bookingCode = req.params.bookingCode;
    const {
        lockToken,
        paymentMethod,
        simulateFailure = false
    } = req.body;

    if (
        typeof lockToken !== "string" ||
        !/^[a-f0-9]{64}$/i.test(lockToken)
    ) {
        return res.status(400).json({
            success: false,
            message: "Token giữ ghế không hợp lệ."
        });
    }

    if (!ALLOWED_METHODS.includes(paymentMethod)) {
        return res.status(400).json({
            success: false,
            message: "Phương thức thanh toán không hợp lệ."
        });
    }

    if (typeof simulateFailure !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "Thông tin mô phỏng thanh toán không hợp lệ."
        });
    }

    let client;
    let transactionStarted = false;
    let seatIds = [];
    let showtimeId = null;
    let shouldReleaseLocks = false;

    try {
        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 1. Lấy booking và khóa dòng booking
        const bookingResult = await client.query(
            `SELECT id, booking_code, showtime_id,
                    total_amount, status
             FROM bookings
             WHERE booking_code = $1
             FOR UPDATE`,
            [bookingCode]
        );

        if (bookingResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đơn đặt vé."
            });
        }

        const booking = bookingResult.rows[0];
        showtimeId = Number(booking.showtime_id);

        // 2. Kiểm tra trạng thái booking
        if (booking.status === "confirmed") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(200).json({
                success: true,
                message: "Đơn đặt vé này đã được thanh toán trước đó.",
                data: {
                    bookingCode: booking.booking_code,
                    status: "confirmed"
                }
            });
        }

        if (booking.status !== "pending") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Đơn đặt vé không còn ở trạng thái chờ thanh toán.",
                status: booking.status
            });
        }

        // 3. Lấy danh sách ghế
        const bookingSeatsResult = await client.query(
            `SELECT seat_id
             FROM booking_seats
             WHERE booking_id = $1
             ORDER BY seat_id`,
            [booking.id]
        );

        seatIds = bookingSeatsResult.rows.map(
            row => Number(row.seat_id)
        );

        if (seatIds.length === 0) {
            await client.query(
                `UPDATE bookings
                 SET status = 'cancelled'
                 WHERE id = $1`,
                [booking.id]
            );

            await client.query("COMMIT");
            transactionStarted = false;
            shouldReleaseLocks = true;

            return res.status(409).json({
                success: false,
                message: "Đơn đặt vé không có ghế."
            });
        }

        // 4. Khóa các dòng ghế trong PostgreSQL
        const seatsResult = await client.query(
            `SELECT id
             FROM seats
             WHERE id = ANY($1::int[])
             ORDER BY id
             FOR UPDATE`,
            [seatIds]
        );

        if (seatsResult.rows.length !== seatIds.length) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Không thể xác minh danh sách ghế."
            });
        }

        // 5. Kiểm tra token Redis
        for (const seatId of seatIds) {
            const valid = await verifySeatLock(
                showtimeId,
                seatId,
                lockToken
            );

            if (!valid) {
                await client.query(
                    `UPDATE bookings
                     SET status = 'cancelled'
                     WHERE id = $1`,
                    [booking.id]
                );

                await client.query("COMMIT");
                transactionStarted = false;
                shouldReleaseLocks = true;

                return res.status(409).json({
                    success: false,
                    message: "Thời gian giữ ghế đã hết. Đơn đặt vé đã bị hủy."
                });
            }
        }

        // 6. Kiểm tra ghế đã được booking khác xác nhận chưa
        const conflictResult = await client.query(
            `SELECT bs.seat_id
             FROM booking_seats bs
             JOIN bookings b ON b.id = bs.booking_id
             WHERE b.showtime_id = $1
               AND b.status = 'confirmed'
               AND b.id <> $2
               AND bs.seat_id = ANY($3::int[])`,
            [showtimeId, booking.id, seatIds]
        );

        if (conflictResult.rows.length > 0) {
            await client.query(
                `UPDATE bookings
                 SET status = 'cancelled'
                 WHERE id = $1`,
                [booking.id]
            );

            await client.query("COMMIT");
            transactionStarted = false;
            shouldReleaseLocks = true;

            return res.status(409).json({
                success: false,
                message: "Một hoặc nhiều ghế đã được xác nhận bởi khách khác. Đơn đặt vé đã bị hủy.",
                conflictSeatIds: conflictResult.rows.map(
                    row => Number(row.seat_id)
                )
            });
        }

        // 7. Mô phỏng thanh toán
        const paymentResult = await processSimulatedPayment({
            bookingCode: booking.booking_code,
            amount: booking.total_amount,
            paymentMethod,
            simulateFailure
        });

        if (!paymentResult.success) {
            await client.query(
                `UPDATE bookings
                 SET status = 'cancelled'
                 WHERE id = $1`,
                [booking.id]
            );

            await client.query("COMMIT");
            transactionStarted = false;
            shouldReleaseLocks = true;

            return res.status(402).json({
                success: false,
                message: paymentResult.message,
                data: {
                    bookingCode: booking.booking_code,
                    status: "cancelled"
                }
            });
        }

        // 8. Kiểm tra token lần cuối trước khi xác nhận
        for (const seatId of seatIds) {
            const valid = await verifySeatLock(
                showtimeId,
                seatId,
                lockToken
            );

            if (!valid) {
                await client.query(
                    `UPDATE bookings
                     SET status = 'cancelled'
                     WHERE id = $1`,
                    [booking.id]
                );

                await client.query("COMMIT");
                transactionStarted = false;
                shouldReleaseLocks = true;

                return res.status(409).json({
                    success: false,
                    message: "Khóa giữ ghế đã hết hạn trong quá trình thanh toán. Đơn đã bị hủy."
                });
            }
        }

        // 9. Xác nhận booking
        const updateResult = await client.query(
            `UPDATE bookings
             SET status = 'confirmed'
             WHERE id = $1
               AND status = 'pending'
             RETURNING id, booking_code, total_amount, status`,
            [booking.id]
        );

        if (updateResult.rows.length === 0) {
            throw new Error("Không thể xác nhận đơn đặt vé.");
        }

        await client.query("COMMIT");
        transactionStarted = false;
        shouldReleaseLocks = true;

        // 10. Giải phóng Redis lock sau khi commit
        for (const seatId of seatIds) {
            await releaseSeatLock(
                showtimeId,
                seatId,
                lockToken
            ).catch(error => {
                console.error(
                    `Release lock error for seat ${seatId}:`,
                    error.message
                );
            });
        }

        return res.status(200).json({
            success: true,
            message: "Thanh toán thành công. Vé đã được xác nhận.",
            data: {
                bookingCode: updateResult.rows[0].booking_code,
                status: updateResult.rows[0].status,
                totalAmount: Number(updateResult.rows[0].total_amount),
                payment: paymentResult
            }
        });

    } catch (error) {
        if (client && transactionStarted) {
            await client.query("ROLLBACK").catch(() => {});
        }

        console.error("Process payment error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Không thể xử lý thanh toán."
        });

    } finally {
        if (client) {
            client.release();
        }

        // Chỉ giải phóng khóa thuộc token của booking này
        if (shouldReleaseLocks && showtimeId !== null) {
            for (const seatId of seatIds) {
                await releaseSeatLock(
                    showtimeId,
                    seatId,
                    lockToken
                ).catch(() => {});
            }
        }
    }
};

module.exports = {
    processPayment
};
