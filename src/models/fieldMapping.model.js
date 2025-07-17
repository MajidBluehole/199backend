module.exports = (sequelize, DataTypes) => {
  const FieldMapping = sequelize.define('FieldMapping', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    connectedDataSourceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'connected_data_sources',
        key: 'id',
      },
      comment: 'Foreign key for the connected data source.',
    },
    sourceFieldPath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Path to the field in the source system, e.g., \'Account.Name\'.',
    },
    relaivaintMasterField: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Path to the field in the master customer record, e.g., \'customer.name\'.',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'FieldMapping',
    tableName: 'field_mappings',
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    underscored: true, // Maps camelCase in the model to snake_case in the database
  });
  return FieldMapping;
};
