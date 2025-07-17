import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database'; // Assuming a sequelize instance is exported from here

class Category extends Model {}

Category.init({
  categoryId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    field: 'category_id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'uk_categories_name',
      msg: 'Category name must be unique.'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: true,
  underscored: true
});

export default Category;
