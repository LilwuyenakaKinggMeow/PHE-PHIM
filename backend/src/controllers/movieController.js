
const pool = require("../config/database");

const getAllMovies = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                movie_code AS id_code,
                title,
                poster,
                age_rating AS age,
                genre,
                rating,
                duration
            FROM movies
            ORDER BY id ASC
        `);

        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("Get movies error:", error.message);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách phim."
        });
    }
};

module.exports = {
    getAllMovies
};
