module.exports = (sequelize, DataTypes) => {
  const MasterCustomer = sequelize.define('MasterCustomer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations', // table name
        key: 'organization_id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    merged_data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'MasterCustomer',
    tableName: 'master_customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_master_customers_org_email',
        fields: ['organization_id', 'email'],
      },
      {
        name: 'idx_master_customers_search',
        type: 'FULLTEXT',
        fields: ['name', 'email', 'company'],
      },
    ],
  });
  return MasterCustomer;
};
