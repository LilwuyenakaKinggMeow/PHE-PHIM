
"use strict";

const pool = require("../config/database");
const crypto = require("crypto");
const {
    verifySeatLock,
    releaseSeatLock
} = require("../services/seatLockService");

// Giá vé được tính tại backend
const SEAT_PRICES = {
    standard: 85000,
    vip: 115000,
    sweetbox: 120000
};

// Tạo mã vé
function generateBookingCode() {
    const randomCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `PPH-${Date.now()}-${randomCode}`;
}

// POST /api/bookings

const createBooking = async (req, res) => {
    const {
        showtimeId,
        customerName,
        customerEmail,
        seatIds,
        lockToken
    } = req.body;

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
    const id = Number(showtimeId);

    if (
        normalizedSeatIds.some(seatId =>
            !Number.isInteger(seatId) || seatId <= 0
        ) ||
        new Set(normalizedSeatIds).size !== normalizedSeatIds.length
    ) {
        return res.status(400).json({
            success: false,
            message: "Danh sách ghế không hợp lệ hoặc bị trùng."
        });
    }

    if (
        typeof lockToken !== "string" ||
        !/^[a-f0-9]{64}$/i.test(lockToken)
    ) {
        return res.status(400).json({
            success: false,
            message: "Token giữ ghế không hợp lệ."
        });
    }

    if (
        typeof customerName !== "string" ||
        customerName.trim().length === 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Vui lòng nhập họ tên khách hàng."
        });
    }

    if (
        typeof customerEmail !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: "Email khách hàng không hợp lệ."
        });
    }

    let client;
    let transactionStarted = false;

    try {
        // 2. Xác minh token Redis cho toàn bộ ghế
        for (const seatId of normalizedSeatIds) {
            const valid = await verifySeatLock(
                id,
                seatId,
                lockToken
            );

            if (!valid) {
                return res.status(409).json({
                    success: false,
                    message: `Ghế ID ${seatId} không còn được bạn giữ hoặc thời gian giữ ghế đã hết.`
                });
            }
        }

        client = await pool.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // 3. Kiểm tra suất chiếu
        const showtimeResult = await client.query(
            `SELECT
                id,
                movie_id,
                cinema_id,
                TO_CHAR(show_date, 'YYYY-MM-DD') AS show_date,
                TO_CHAR(start_time, 'HH24:MI:SS') AS start_time,
                (
                    (show_date + start_time)
                    <= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')
                ) AS has_started
             FROM showtimes
             WHERE id = $1
             FOR SHARE`,
            [id]
        );

        if (showtimeResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy suất chiếu."
            });
        }

        const showtime = showtimeResult.rows[0];

        if (showtime.has_started) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Suất chiếu đã bắt đầu hoặc đã qua giờ chiếu."
            });
        }

        // 4. Khóa các dòng ghế trong PostgreSQL
        const seatsResult = await client.query(
            `SELECT id, cinema_id, seat_code, seat_type
             FROM seats
             WHERE id = ANY($1::int[])
             ORDER BY id
             FOR UPDATE`,
            [normalizedSeatIds]
        );

        if (seatsResult.rows.length !== normalizedSeatIds.length) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Một hoặc nhiều ghế không tồn tại."
            });
        }

        const seats = seatsResult.rows;

        // 5. Kiểm tra ghế thuộc đúng rạp
        const invalidCinemaSeat = seats.some(
            seat => Number(seat.cinema_id) !== Number(showtime.cinema_id)
        );

        if (invalidCinemaSeat) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(400).json({
                success: false,
                message: "Có ghế không thuộc rạp của suất chiếu."
            });
        }

        // 6. Kiểm tra ghế đã được xác nhận đặt chưa
        const bookedResult = await client.query(
            `SELECT bs.seat_id
             FROM booking_seats bs
             JOIN bookings b ON b.id = bs.booking_id
             WHERE b.showtime_id = $1
               AND b.status = 'confirmed'
               AND bs.seat_id = ANY($2::int[])`,
            [id, normalizedSeatIds]
        );

        if (bookedResult.rows.length > 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(409).json({
                success: false,
                message: "Một hoặc nhiều ghế đã được khách khác đặt.",
                bookedSeatIds: bookedResult.rows.map(row => row.seat_id)
            });
        }

        // 7. Kiểm tra lại token sau khi đã khóa dòng ghế
        for (const seatId of normalizedSeatIds) {
            const valid = await verifySeatLock(
                id,
                seatId,
                lockToken
            );

            if (!valid) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    success: false,
                    message: "Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế."
                });
            }
        }

        // 8. Tính giá vé tại backend
        const bookingSeats = seats.map(seat => {
            // Hàng H là ghế Sweetbox
            const isSweetbox = seat.seat_code.startsWith("H");

            // Giá tính trên từng ghế vật lý
            const price = isSweetbox
                ? SEAT_PRICES.sweetbox
                : SEAT_PRICES[seat.seat_type];

            if (!price) {
                throw new Error(
                    `Chưa cấu hình giá cho loại ghế: ${seat.seat_type}`
                );
            }

            return {
                id: seat.id,
                code: seat.seat_code,
                type: isSweetbox ? "sweetbox" : seat.seat_type,
                price
            };
        });

        const totalAmount = bookingSeats.reduce(
            (total, seat) => total + seat.price,
            0
        );

        // 9. Tạo booking ở trạng thái pending
        const bookingCode = generateBookingCode();

        const bookingResult = await client.query(
            `INSERT INTO bookings (
                booking_code,
                customer_name,
                customer_email,
                showtime_id,
                total_amount,
                status
             )
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING id, booking_code, customer_name,
                       customer_email, showtime_id,
                       total_amount, status, created_at`,
            [
                bookingCode,
                customerName.trim(),
                customerEmail.trim(),
                id,
                totalAmount
            ]
        );

        const booking = bookingResult.rows[0];

        // 10. Lưu các ghế vào booking_seats
        for (const seat of bookingSeats) {
            await client.query(
                `INSERT INTO booking_seats (
                    booking_id,
                    seat_id,
                    price
                 )
                 VALUES ($1, $2, $3)`,
                [booking.id, seat.id, seat.price]
            );
        }

        // 11. Hoàn tất transaction
        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(201).json({
            success: true,
            message: "Tạo đơn đặt vé thành công. Vui lòng thanh toán.",
            data: {
                bookingId: booking.id,
                bookingCode: booking.booking_code,
                customerName: booking.customer_name,
                customerEmail: booking.customer_email,
                showtimeId: booking.showtime_id,
                showDate: showtime.show_date,
                startTime: showtime.start_time,
                seats: bookingSeats,
                totalAmount: Number(booking.total_amount),
                status: booking.status,
                createdAt: booking.created_at
            }
        });

    } catch (error) {
        if (client && transactionStarted) {
            await client.query("ROLLBACK").catch(() => { });
        }

        // Nếu tạo booking lỗi, giải phóng những khóa thuộc token này
        for (const seatId of normalizedSeatIds) {
            await releaseSeatLock(id, seatId, lockToken).catch(() => { });
        }

        console.error("Create booking error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Không thể tạo đơn đặt vé."
        });

    } finally {
        if (client) {
            client.release();
        }
    }
};


// GET /api/bookings/:bookingCode
const getBookingByCode = async (req, res) => {
    const { bookingCode } = req.params;

    if (
        typeof bookingCode !== "string" ||
        !/^PPH-\d{13}-[A-F0-9]{8}$/i.test(bookingCode)
    ) {
        return res.status(400).json({
            success: false,
            message: "Mã đặt vé không hợp lệ."
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                b.id AS booking_id,
                b.booking_code,
                b.customer_name,
                b.customer_email,
                TO_CHAR(s.show_date, 'DD/MM/YYYY') AS show_date,
                TO_CHAR(s.start_time, 'HH24:MI') AS start_time,
                m.title AS movie_title,
                m.poster AS movie_poster,
                c.name AS cinema_name,
                b.total_amount,
                b.status,
                b.created_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'seatCode', st.seat_code,
                            'seatType', st.seat_type,
                            'price', bs.price
                        )
                        ORDER BY st.seat_code
                    ) FILTER (WHERE st.id IS NOT NULL),
                    '[]'::json
                ) AS seats
             FROM bookings b
             JOIN showtimes s ON s.id = b.showtime_id
             JOIN movies m ON m.id = s.movie_id
             JOIN cinemas c ON c.id = s.cinema_id
             LEFT JOIN booking_seats bs ON bs.booking_id = b.id
             LEFT JOIN seats st ON st.id = bs.seat_id
             WHERE UPPER(b.booking_code) = UPPER($1)
             GROUP BY
                b.id,
                s.show_date,
                s.start_time,
                m.title,
                m.poster,
                c.name`,
            [bookingCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy vé với mã đặt vé này."
            });
        }

        const booking = result.rows[0];

        return res.status(200).json({
            success: true,
            message: "Tra cứu vé thành công.",
            data: {
                bookingId: booking.booking_id,
                bookingCode: booking.booking_code,
                customerName: booking.customer_name,
                customerEmail: booking.customer_email,
                movieTitle: booking.movie_title,
                poster: booking.movie_poster,
                cinemaName: booking.cinema_name,
                showDate: booking.show_date,
                startTime: booking.start_time,
                seats: booking.seats,
                totalAmount: Number(booking.total_amount),
                status: booking.status,
                createdAt: booking.created_at
            }
        });

    } catch (error) {
        console.error("Get booking error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Không thể tra cứu thông tin vé."
        });
    }
};

module.exports = {
    createBooking,
    getBookingByCode
};
