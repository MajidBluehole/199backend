module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define('Subscriber', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'SET NULL'
    },
    source: {
      type: DataTypes.ENUM('website', 'popup', 'referral', 'manual', 'social', 'api'),
      defaultValue: 'website'
    },
    status: {
      type: DataTypes.ENUM('subscribed', 'unsubscribed', 'bounced', 'complained'),
      defaultValue: 'subscribed'
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmedAt: {
      type: DataTypes.DATE
    },
    unsubscribedAt: {
      type: DataTypes.DATE
    },
    unsubscribedReason: {
      type: DataTypes.STRING
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.TEXT
    },
    locale: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.JSON
    },
    lastEmailedAt: {
      type: DataTypes.DATE
    },
    bounceCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    complaintCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'Subscribers',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['status'] },
      { fields: ['userId'] },
      { fields: ['createdAt'] }
    ]
  });

  return Subscriber;
};
