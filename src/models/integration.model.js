module.exports = (sequelize, DataTypes) => {
  const Integration = sequelize.define('Integration', {
  integrationId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'organization_id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'SALESFORCE', 'HUBSPOT', 'ZENDESK', 'SERVICENOW',
      'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS'
    ),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      'CONNECTED', 'DISCONNECTED', 'ERROR'
    ),
    allowNull: false,
    defaultValue: 'DISCONNECTED',
  },
  credentials: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Encrypted credentials or tokens in JSON format.',
  },
  lastSyncAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // 'updatedAt' is handled by Sequelize's `timestamps` option below
}, {
  sequelize,
  modelName: 'Integration',
  tableName: 'integrations',
  underscored: true, // Maps camelCase in the model to snake_case in the database
  timestamps: true, // Enables createdAt and updatedAt
  createdAt: false, // Disable createdAt as it's not in the spec
  // 'updatedAt' will be automatically mapped to 'updated_at' due to 'underscored: true'
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'type'], // Use snake_case for fields in index definitions
      name: 'idx_integrations_org_id_type',
    },
  ],
});
  return Integration;
};
