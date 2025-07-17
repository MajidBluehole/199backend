const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class InsightModel extends Model {
    
    static associate(models) {
      InsightModel.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization',
      });
    }
  }

  InsightModel.init({
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
        model: 'organizations', // table name
        key: 'id',
      },
    },
    modelKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'A unique key for the model, e.g., \'topic_detection\'.',
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    configuration: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Stores model-specific parameters like sensitivity or thresholds.',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'InsightModel',
    tableName: 'insight_models',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // a_b vs aB
    indexes: [
      {
        unique: true,
        fields: ['organization_id', 'model_key'],
        name: 'idx_insight_models_organization_key',
      },
    ],
  });

  return InsightModel;
};
