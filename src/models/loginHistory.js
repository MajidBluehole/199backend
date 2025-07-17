module.exports = (sequelize, DataTypes) => {
  const LoginHistory = sequelize.define('LoginHistory', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    email: {
      type: DataTypes.STRING
    },
    loginStatus: {
      type: DataTypes.ENUM('success', 'failure'),
      allowNull: false
    },
    failureReason: {
      type: DataTypes.STRING
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: {
      type: DataTypes.TEXT
    },
    deviceId: {
      type: DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
    loginTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'LoginHistory',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['loginTime'] }
    ]
  });

  return LoginHistory;
};
