module.exports = (sequelize, DataTypes) => {
  const Keyword = sequelize.define('Keyword', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'organization_id',
    },
  },
  keywordText: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Keyword',
  tableName: 'keywords',
  timestamps: true, // Automatically manages createdAt and updatedAt
  underscored: true, // Maps camelCase fields in the model to snake_case columns in the DB
  indexes: [
    {
      name: 'idx_keywords_organization_id',
      fields: ['organization_id'],
    },
  ],
});
  return Keyword;
};
