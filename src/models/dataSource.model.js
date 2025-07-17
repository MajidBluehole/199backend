module.exports = (sequelize, DataTypes) => {
  const DataSource = sequelize.define('DataSource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations', // table name
        key: 'organization_id',
      },
      field: 'organization_id',
    },
    sourceType: {
      type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'SERVICENOW', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS'),
      allowNull: false,
      field: 'source_type',
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'display_name',
    },
    connectionStatus: {
      type: DataTypes.ENUM('CONNECTED', 'DISCONNECTED', 'ERROR'),
      allowNull: false,
      defaultValue: 'DISCONNECTED',
      field: 'connection_status',
    },
    credentials: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    lastErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'last_error_message',
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_sync_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'DataSource',
    tableName: 'data_sources',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // Use snake_case for column names in DB
    indexes: [
      {
        name: 'idx_data_sources_organization_id',
        fields: ['organization_id'],
      },
      {
        name: 'idx_data_sources_status_type',
        fields: ['organization_id', 'connection_status', 'source_type'],
      },
    ],
  });
  return DataSource;
};
