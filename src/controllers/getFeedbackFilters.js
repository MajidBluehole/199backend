const db = require('../config/database');


const getFeedbackFilters = async (req, res) => {
  try {
    const pool = await db.getPool();

    // Execute all queries in parallel for efficiency
    const [
      usersResult,
      categoriesResult,
      feedbackTypesResult,
      tagsResult
    ] = await Promise.all([
      pool.query('SELECT user_id, firstName FROM users WHERE deleted_at IS NULL ORDER BY firstName ASC'),
      pool.query('SELECT DISTINCT recommendation_category FROM feedback WHERE recommendation_category IS NOT NULL AND recommendation_category != \'\' ORDER BY recommendation_category ASC'),
      pool.query('SELECT DISTINCT feedback_type FROM feedback WHERE feedback_type IS NOT NULL AND feedback_type != \'\' ORDER BY feedback_type ASC'),
      pool.query('SELECT tag_id, tag_name FROM feedback_tags ORDER BY tag_name ASC')
    ]);

    // Extract users from the first result set
    const users = usersResult[0];

    // Extract and flatten the distinct categories into a simple array of strings
    const categories = categoriesResult[0].map(row => row.recommendation_category);

    // Extract and flatten the distinct feedback types into a simple array of strings
    const feedbackTypes = feedbackTypesResult[0].map(row => row.feedback_type);

    // Extract tags from the fourth result set
    const tags = tagsResult[0];

    res.status(200).json({
      users,
      categories,
      feedbackTypes,
      tags
    });

  } catch (error) {
    console.error('Error fetching feedback filters:', error);
    res.status(500).json({ message: 'An error occurred while fetching filter options.' });
  }
};

module.exports = {
  getFeedbackFilters
};