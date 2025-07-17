module.exports = (sequelize, DataTypes) => {
  const CrashReport = sequelize.define('CrashReport', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'users', // assumes there's a Users table
        key: 'user_id'
      },
      onDelete: 'SET NULL'
    },
    sessionId: {
      type: DataTypes.STRING
    },
    appVersion: {
      type: DataTypes.STRING
    },
    platform: {
      type: DataTypes.ENUM('web', 'ios', 'android', 'backend', 'desktop'),
      allowNull: false
    },
    environment: {
      type: DataTypes.ENUM('production', 'staging', 'development'),
      defaultValue: 'production'
    },
    errorType: {
      type: DataTypes.STRING
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    stackTrace: {
      type: DataTypes.TEXT('long')
    },
    filePath: {
      type: DataTypes.STRING
    },
    lineNumber: {
      type: DataTypes.INTEGER
    },
    columnNumber: {
      type: DataTypes.INTEGER
    },
    deviceModel: {
      type: DataTypes.STRING
    },
    osVersion: {
      type: DataTypes.STRING
    },
    browserName: {
      type: DataTypes.STRING
    },
    browserVersion: {
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
    metadata: {
      type: DataTypes.JSON
    },
    occurredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'CrashReports',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['platform'] },
      { fields: ['environment'] },
      { fields: ['errorType'] },
      { fields: ['occurredAt'] }
    ]
  });

  return CrashReport;
};
