module.exports = (sequelize, DataTypes) => {
  const UserIntegration = sequelize.define('UserIntegration', {
    integrationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'integration_id',
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    serviceName: {
      type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS', 'CALENDAR'),
      allowNull: false,
      field: 'service_name',
    },
    accessTokenEncrypted: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'access_token_encrypted',
    },
    refreshTokenEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refresh_token_encrypted',
    },
    status: {
      type: DataTypes.ENUM('CONNECTED', 'DISCONNECTED', 'ERROR'),
      allowNull: false,
      defaultValue: 'DISCONNECTED',
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_sync_at',
    },
    // createdAt is handled by Sequelize's timestamps option
  }, {
    sequelize,
    modelName: 'UserIntegration',
    tableName: 'user_integrations',
    timestamps: true,       // Enable timestamps
    updatedAt: false,       // Disable updatedAt
    createdAt: 'created_at', // Map createdAt to the correct column name
    indexes: [
      {
        name: 'idx_user_integrations_user_id',
        fields: ['user_id'],
      },
      {
        name: 'idx_user_integrations_user_service',
        unique: true,
        fields: ['user_id', 'service_name'],
      },
    ],
  });
  return UserIntegration;
};
