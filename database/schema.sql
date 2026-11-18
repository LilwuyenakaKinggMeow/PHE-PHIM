
-- PHÊ PHIM - DATABASE SCHEMA

CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showtimes (
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL REFERENCES movies(id),
    start_time TIMESTAMPTZ NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    seat_code VARCHAR(10) NOT NULL,
    UNIQUE(room_name, seat_code)
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    showtime_id INTEGER NOT NULL REFERENCES showtimes(id),
    customer_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_booking_status
        CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS booking_seats (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    showtime_id INTEGER NOT NULL REFERENCES showtimes(id),
    seat_id INTEGER NOT NULL REFERENCES seats(id),
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
    CONSTRAINT valid_seat_status
        CHECK (status IN ('confirmed', 'cancelled'))
);

-- Một ghế chỉ được xác nhận một lần trong cùng suất chiếu
CREATE UNIQUE INDEX IF NOT EXISTS
    unique_confirmed_seat_per_showtime
ON booking_seats(showtime_id, seat_id)
WHERE status = 'confirmed';

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_payment_status
        CHECK (status IN ('pending', 'success', 'failed'))
);
