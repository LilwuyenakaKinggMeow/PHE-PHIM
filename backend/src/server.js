
"use strict";

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ================================
// KET NOI DATABASE VA REDIS
// ================================
const pool = require("./config/db");
const redisClient = require("./config/redis");

// ================================
// IMPORT ROUTES
// ================================
const seatRoutes = require("./routes/seats");
const bookingRoutes = require("./routes/bookings");
const showtimeRoutes = require("./routes/showtimes-vandung");

// ================================
// KHOI TAO EXPRESS
// ================================
const app = express();
const PORT = process.env.PORT || 3000;

// ================================
// MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// API ROUTES
// ================================

// Lay danh sach ghe va giu ghe bang Redis
app.use("/api/seats", seatRoutes);

// Xac nhan dat ve va thanh toan gia lap
app.use("/api/bookings", bookingRoutes);

// Lay danh sach suat chieu tu PostgreSQL
app.use("/api/showtimes", showtimeRoutes);

// ================================
// KIEM TRA BACKEND
// GET /api/health
// ================================
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "PHE PHIM Backend is running",
        status: "online"
    });
});

// ================================
// KIEM TRA POSTGRESQL
// GET /api/test-db
// ================================
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database(), current_user"
        );

        res.json({
            success: true,
            message: "PostgreSQL connected",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("PostgreSQL error:", error);

        res.status(500).json({
            success: false,
            message: "PostgreSQL connection failed"
        });
    }
});

// ================================
// KIEM TRA REDIS
// GET /api/test-redis
// ================================
app.get("/api/test-redis", async (req, res) => {
    try {
        const result = await redisClient.ping();

        res.json({
            success: true,
            message: "Redis connected",
            response: result
        });

    } catch (error) {
        console.error("Redis error:", error);

        res.status(500).json({
            success: false,
            message: "Redis connection failed"
        });
    }
});

// ================================
// XU LY API KHONG TON TAI
// ================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API khong ton tai"
    });
});

// ================================
// KHOI DONG BACKEND
// ================================
async function startServer() {
    try {
        // Kiem tra PostgreSQL
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully");

        // Ket noi Redis
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        console.log("Redis connected successfully");

        // Khoi dong Express
        app.listen(PORT, () => {
            console.log("=================================");
            console.log("PHE PHIM BACKEND");
            console.log(`Server: http://localhost:${PORT}`);
            console.log("PostgreSQL: Connected");
            console.log("Redis: Connected");
            console.log("=================================");
            console.log("Available APIs:");
            console.log("GET  /api/health");
            console.log("GET  /api/test-db");
            console.log("GET  /api/test-redis");
            console.log("GET  /api/showtimes?movieId=1");
            console.log("GET  /api/seats?showtimeId=1");
            console.log("POST /api/seats/hold");
            console.log("POST /api/bookings/confirm");
            console.log("=================================");
        });

    } catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}

startServer();
