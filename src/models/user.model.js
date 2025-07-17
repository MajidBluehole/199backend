const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming sequelize instance is exported from here

class User extends Model {
  
  static associate(models) {
    // define association here
    User.belongsTo(models.Workspace, {
      foreignKey: 'workspaceId',
      as: 'workspace',
    });
    // Example: User has many Feedback items
    // User.hasMany(models.Feedback, { foreignKey: 'userId' });
  }
}

User.init({
  userId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    field: 'user_id'
  },
  workspaceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'workspaces', // table name
      key: 'workspace_id',
    },
    field: 'workspace_id'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  firstName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'last_name'
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  role: {
    type: DataTypes.ENUM('Admin', 'User', 'ReadOnly'),
    allowNull: false,
    defaultValue: 'User',
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
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deleted_at'
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true, // Enables createdAt and updatedAt
  paranoid: true,   // Enables soft deletes by using deletedAt
  underscored: false, // Fields are explicitly mapped, so this is not strictly needed but good practice to be explicit
});

module.exports = User;
