const db = require('../config/database');

exports.getFilterOptions = async (req, res) => {
  try {
    const sql = 'SELECT * FROM filter_options';
    const [rows] = await db.query(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch filter options' });
  }
};