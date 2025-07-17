const { User } = require('../../models/User');

exports.getUserDashboard = async (req, res) => {
  try {
    const { firstName, lastName, lastLogin } = req.user;

    res.status(200).json({
      success: true,
      firstName,
      lastName,
      lastLogin
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load user dashboard' });
  }
};
