module.exports = (sequelize, DataTypes) => {
  const FilterOption = sequelize.define('FilterOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  categoryName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'category_name',
    comment: 'The name of the filter group, e.g., \'Region\', \'Product\'.'
  },
  value: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'A specific option within the category, e.g., \'North America\', \'Product X\'.'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order'
  }
}, {
  sequelize,
  modelName: 'FilterOption',
  tableName: 'filter_options',
  timestamps: true, // Enables createdAt and updatedAt
  underscored: true, // Uses snake_case for columns in DB
  indexes: [
    {
      unique: true,
      fields: ['category_name', 'value'],
      name: 'idx_filter_options_category_value'
    }
  ]
});
  return FilterOption;
};
