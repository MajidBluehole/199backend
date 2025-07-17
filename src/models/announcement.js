module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('Announcement', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'success', 'error', 'promo', 'maintenance'),
      defaultValue: 'info'
    },
    category: {
      type: DataTypes.STRING(100)
    },
    audience: {
      type: DataTypes.ENUM('all', 'logged_in', 'admins', 'guests'),
      defaultValue: 'all'
    },
    targetUrl: {
      type: DataTypes.STRING(512)
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isSticky: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDismissible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayFrom: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    displayTo: {
      type: DataTypes.DATE
    },
    createdBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'SET NULL',
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'SET NULL',
      allowNull: true
    }
  }, {
    tableName: 'Announcements',
    timestamps: true,
    indexes: [
      { fields: ['displayFrom', 'displayTo'] },
      { fields: ['audience'] },
      { fields: ['isActive'] }
    ]
  });

  return Announcement;
};
