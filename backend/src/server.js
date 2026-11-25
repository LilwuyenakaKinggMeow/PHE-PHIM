
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const redisClient = require("./config/redis");

const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const cinemaRoutes = require("./routes/cinemaRoutes");
const seatRoutes = require("./routes/seatRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const seatLockRoutes = require("./routes/seatLockRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PHE PHIM Backend is running",
        status: "online",
        version: process.env.APP_VERSION || "A",
        instance: process.env.INSTANCE_NAME || "local",
        redis: redisClient.isReady ? "connected" : "disconnected"
    });
});

app.use("/api/movies", movieRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/seat-locks", seatLockRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await redisClient.connect();

        app.listen(PORT, () => {
            console.log(`PHE PHIM Backend running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();
