module.exports = (sequelize, DataTypes) => {
  const ConnectedDataSource = sequelize.define('ConnectedDataSource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  sourceType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  connectionStatus: {
    type: DataTypes.ENUM('PENDING', 'CONNECTED', 'ERROR', 'SYNCING'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  credentials: {
    type: DataTypes.JSON,
    allowNull: false
  },
  syncSchedule: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'DAILY'
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastSyncStatus: {
    type: DataTypes.ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS', 'PARTIAL_SUCCESS'),
    allowNull: true
  },
  lastSyncErrorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'ConnectedDataSource',
  tableName: 'connected_data_sources',
  timestamps: true, // Enables createdAt and updatedAt
  underscored: true, // Maps camelCase fields to snake_case columns
  indexes: [
    {
      name: 'idx_connected_data_sources_org_id',
      fields: ['organization_id']
    },
    {
      name: 'idx_connected_data_sources_status',
      fields: ['organization_id', 'connection_status']
    }
  ]
});
  return ConnectedDataSource;
};
