module.exports = (sequelize, DataTypes) => {
  const RecommendationWeight = sequelize.define('RecommendationWeight', {
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
    attributeKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: 0,
        max: 100,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'RecommendationWeight',
    tableName: 'recommendation_weights',
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    underscored: true, // Maps camelCase in the model to snake_case in the database
    indexes: [
      {
        unique: true,
        fields: ['organization_id', 'attribute_key'],
        name: 'idx_rec_weights_organization_key',
      },
    ],
  });
  return RecommendationWeight;
};
