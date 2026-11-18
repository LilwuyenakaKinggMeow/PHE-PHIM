
const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET /api/showtimes?movieId=1
router.get("/", async (req, res) => {
    const movieId = Number(req.query.movieId);

    if (!Number.isSafeInteger(movieId) || movieId <= 0) {
        return res.status(400).json({
            success: false,
            message: "movieId khong hop le"
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                st.id,
                st.movie_id AS "movieId",
                st.start_time AS "startTime",
                st.room_name AS "roomName",
                m.title AS "movieTitle"
             FROM showtimes st
             JOIN movies m ON m.id = st.movie_id
             WHERE st.movie_id = $1
             ORDER BY st.start_time`,
            [movieId]
        );

        return res.json({
            success: true,
            showtimes: result.rows
        });

    } catch (error) {
        console.error("Get showtimes error:", error);

        return res.status(500).json({
            success: false,
            message: "Loi khi lay suat chieu"
        });
    }
});

module.exports = router;
