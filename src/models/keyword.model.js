const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Assuming a database configuration file

class Keyword extends Model {
  
  static associate(models) {
    // Define association to Organization model
    this.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
  }
}

Keyword.init({
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
      key: 'id',
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

module.exports = Keyword;