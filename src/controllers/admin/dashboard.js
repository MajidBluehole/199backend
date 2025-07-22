const { User, Transaction, ContactForm, Subscriber, CrashReport } = require("../../models");

exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      contactMessages,
      totalSubscribers,
      crashReports,
      totalRevenue,
      recentUsers,
      recentTransactions
    ] = await Promise.all([
      User.count(), // Total users count
      User.count({ where: { isActive: true } }), // Count active users
      Transaction.count({ where: { status: 'success' } }), // Count successful transactions
      ContactForm.count(), // Count contact messages
      Subscriber.count(), // Count total subscribers
      CrashReport.count(), // Count crash reports
      Transaction.sum('amountPaid', {
        where: { status: 'success' }
      }), // Sum of successful transactions' amountPaid
      User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['firstName', 'lastName', 'email', 'createdAt']
      }), // Get recent users
      Transaction.findAll({
        where: { status: 'success' },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['amountPaid', 'status', 'createdAt', 'user_id']
      }) // Get recent successful transactions
    ]);

    res.status(200).json({
      success: true,
      totalUsers,
      activeUsers,
      totalTransactions,
      contactMessages,
      totalSubscribers,
      crashReports,
      totalRevenue: totalRevenue || 0, // Default to 0 if no revenue
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
};
