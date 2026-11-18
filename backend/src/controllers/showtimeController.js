
const pool = require("../config/database");

// Lấy danh sách suất chiếu
const getShowtimes = async (req, res) => {
    try {
        const { movie, cinema, date } = req.query;

        let query = `
            SELECT
                s.id,
                s.movie_id,
                m.movie_code,
                m.title AS movie_title,
                s.cinema_id,
                c.name AS cinema_name,
                c.address AS cinema_address,
                s.show_date,
                s.start_time
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            JOIN cinemas c ON s.cinema_id = c.id
            WHERE 1 = 1
        `;

        const values = [];

        if (movie) {
            values.push(movie);
            query += ` AND m.movie_code = $${values.length}`;
        }

        if (cinema) {
            values.push(cinema);
            query += ` AND s.cinema_id = $${values.length}`;
        }

        if (date) {
            values.push(date);
            query += ` AND s.show_date = $${values.length}`;
        }

        query += `
            ORDER BY
                s.show_date ASC,
                s.start_time ASC
        `;

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get showtimes error:", error.message);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách suất chiếu."
        });
    }
};

module.exports = {
    getShowtimes
};
