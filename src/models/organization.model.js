const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Organization extends Model {}

  Organization.init({
    organization_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // Disable updatedAt if it's not in the schema
  });

  return Organization;
};