const { Sequelize } = require('sequelize');
const { Notification } = require('../../models');

// GET /user/notifications?page=1
exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id;  // Use user.id instead of _id for Sequelize
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const notifications = await Notification.findAll({
      where: {
        [Sequelize.Op.or]: [
          { user_id: user_id },
          { isBroadcast: true }
        ]
      },
      order: [['sentAt', 'DESC']],
      limit: limit,
      offset: offset,
    });

    const total = await Notification.count({
      where: {
        [Sequelize.Op.or]: [
          { user_id: user_id },
          { isBroadcast: true }
        ]
      }
    });

    res.status(200).json({
      success: true,
      page,
      total,
      pages: Math.ceil(total / limit),
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// PUT /user/notifications/:id/read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id;

    const notification = await Notification.findOne({
      id: id,
      $or: [{ user_id: user_id }, { isBroadcast: true }]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

// PUT /user/notifications/read-all
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result = await Notification.updateMany(
      {
        $or: [{ user_id: user_id }, { isBroadcast: true }],
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};
