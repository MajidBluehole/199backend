const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Contact extends Model {
    
    static associate(models) {
      // define association here
      Contact.belongsTo(models.Workspace, {
        foreignKey: 'workspaceId',
        as: 'workspace',
      });
      Contact.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'owner',
      });
    }
  }

  Contact.init({
    contactId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'contact_id',
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'workspace_id',
      references: {
        model: 'workspaces', // table name
        key: 'workspace_id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users', // table name
        key: 'user_id',
      },
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'company_name',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sourceSystem: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'source_system',
    },
    sourceRecordId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'source_record_id',
    },
    lastContactDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_contact_date',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    underscored: false, // Fields are explicitly named, so this is not strictly needed but good practice
  });

  return Contact;
};