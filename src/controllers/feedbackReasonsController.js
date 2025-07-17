const db = require('../config/db'); // Assuming a mysql2 connection pool is exported from this file
const asyncHandler = require('../middleware/asyncHandler'); // A utility to handle async errors


const getFeedbackReasons = asyncHandler(async (req, res, next) => {
    const query = 'SELECT reason_id, reason_text FROM feedback_reasons WHERE is_active = ?';

    const [reasons] = await db.promise().query(query, [true]);

    res.status(200).json(reasons);
});

module.exports = {
    getFeedbackReasons,
};