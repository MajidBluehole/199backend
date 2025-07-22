module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      field: 'user_id',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'promo', 'system'),
      defaultValue: 'info'
    },
    channel: {
      type: DataTypes.ENUM('in_app', 'email', 'push', 'sms', 'all'),
      defaultValue: 'in_app'
    },
    actionUrl: {
      type: DataTypes.STRING(512)
    },
    imageUrl: {
      type: DataTypes.STRING(512)
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isBroadcast: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    readAt: {
      type: DataTypes.DATE
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    metadata: {
      type: DataTypes.JSON
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'Notifications',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['isRead'] },
      { fields: ['sentAt'] },
      { fields: ['type'] }
    ]
  });

  return Notification;
};
