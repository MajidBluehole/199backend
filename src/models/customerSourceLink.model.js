module.exports = (sequelize, DataTypes) => {
  const CustomerSourceLink = sequelize.define('CustomerSourceLink', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    masterCustomerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Foreign key to the master_customers table.',
      references: {
        model: 'master_customers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    connectedDataSourceId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Foreign key to the connected_data_sources table.',
      references: {
        model: 'connected_data_sources',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sourceRecordId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'The unique identifier of the record in the source system.',
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'The timestamp when the record was last synchronized.',
    },
  }, {
    sequelize,
    modelName: 'CustomerSourceLink',
    tableName: 'customer_source_links',
    timestamps: false, // Manually handled by last_synced_at
    underscored: true, // Maps camelCase model attributes to snake_case table columns
    indexes: [
      {
        name: 'idx_customer_source_links_master_id',
        fields: ['master_customer_id'],
      },
      {
        name: 'idx_customer_source_links_source_record',
        unique: true,
        fields: ['connected_data_source_id', 'source_record_id'],
      },
    ],
  });
  return CustomerSourceLink;
};
