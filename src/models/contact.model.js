module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    contactId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'contact_id',
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
      field: 'user_id',
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
