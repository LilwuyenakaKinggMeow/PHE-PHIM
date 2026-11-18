
const pool = require("../config/database");

const getAllCinemas = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                address
            FROM cinemas
            ORDER BY id ASC
        `);

        res.status(200).json({
            success: true,
            total: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Get cinemas error:", error.message);

        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách rạp."
        });
    }
};

module.exports = {
    getAllCinemas
};
