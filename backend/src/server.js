const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const movieRoutes = require("./routes/movieRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const cinemaRoutes = require("./routes/cinemaRoutes");
const seatRoutes = require("./routes/seatRoutes"); // Đã thêm khai báo seatRoutes

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PHE PHIM Backend is running",
        status: "online"
    });
});

// Movie API
app.use("/api/movies", movieRoutes);

// Showtime API
app.use("/api/showtimes", showtimeRoutes);

// Cinema API
app.use("/api/cinemas", cinemaRoutes);

// Seat API
app.use("/api/seats", seatRoutes); // Đã thêm đăng ký route cho seats

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`PHE PHIM Backend running at http://localhost:${PORT}`);
});