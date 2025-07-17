module.exports = (sequelize, DataTypes) => {
  const CustomFieldOption = sequelize.define('CustomFieldOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  customFieldId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'custom_fields', // This is a reference to another model's table
      key: 'id'
    },
    field: 'custom_field_id'
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order'
  }
}, {
  sequelize,
  modelName: 'CustomFieldOption',
  tableName: 'custom_field_options',
  timestamps: false // No createdAt/updatedAt columns in the table definition
});
  return CustomFieldOption;
};
