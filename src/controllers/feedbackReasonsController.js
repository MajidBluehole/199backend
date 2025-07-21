const db = require('../config/database'); // Assuming a mysql2 connection pool is exported from this file
// const asyncHandler = require('../middleware/asyncHandler'); // A utility to handle async errors


const getFeedbackReasons = async (req, res) => {
  try {
    const query = 'SELECT * FROM feedback_reasons WHERE is_active = ?';
    const [reasons] = await db.query(query, [true]);
    res.status(200).json(reasons);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback reasons' });
  }
};

module.exports = {
    getFeedbackReasons,
};