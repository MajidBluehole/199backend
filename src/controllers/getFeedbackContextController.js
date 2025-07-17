const db = require('../config/database'); // Assuming a db connection pool utility


const getFeedbackContext = async (req, res) => {
    const { recommendation_id } = req.params;

    if (!recommendation_id) {
        return res.status(400).json({ message: 'Bad Request - recommendation_id is required.' });
    }

    try {
        const connection = await db.getConnection();
        const query = `
            SELECT 
                recommendation_id, 
                recommendation_text, 
                source_system, 
                generated_at 
            FROM 
                recommendations 
            WHERE 
                recommendation_id = ?;
        `;

        const [results] = await connection.execute(query, [recommendation_id]);
        connection.release();

        if (results.length === 0) {
            return res.status(404).json({ message: 'Not Found - The specified recommendation_id does not exist.' });
        }

        res.status(200).json(results[0]);

    } catch (error) {
        console.error(`Error fetching recommendation context for ID ${recommendation_id}:`, error);
        // Check for specific MySQL errors if needed, e.g., invalid UUID format
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
             return res.status(400).json({ message: 'Bad Request - Invalid recommendation_id format.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getFeedbackContext,
};