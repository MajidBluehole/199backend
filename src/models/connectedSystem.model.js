module.exports = (sequelize, DataTypes) => {
  const ConnectedSystem = sequelize.define('ConnectedSystem', {
    system_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations', // This is a reference to another model/table
        key: 'organization_id',
      },
    },
    system_type: {
      type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'GMAIL', 'OUTLOOK', 'ZENDESK', 'ZOOM', 'TEAMS'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('CONNECTED', 'DISCONNECTED', 'ERROR', 'SYNCING'),
      allowNull: false,
      defaultValue: 'DISCONNECTED',
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ConnectedSystem',
    tableName: 'connected_systems',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // Use snake_case for DB columns
    indexes: [
      {
        name: 'idx_connected_systems_organization_id',
        fields: ['organization_id'],
      },
    ],
  });
  return ConnectedSystem;
};
