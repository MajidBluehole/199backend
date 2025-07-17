const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Assuming a sequelize instance is exported from this path

class CustomFieldOption extends Model {}

CustomFieldOption.init({
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

// It's a good practice to define associations, assuming a CustomField model exists
// CustomFieldOption.associate = (models) => {
//   CustomFieldOption.belongsTo(models.CustomField, {
//     foreignKey: 'customFieldId',
//     as: 'customField',
//     onDelete: 'CASCADE'
//   });
// };

module.exports = CustomFieldOption;
