module.exports = (sequelize, DataTypes) => {
  const Recommendation = sequelize.define('Recommendation', {
    recommendation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    source_system: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    source_context_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    recommendation_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    tableName: 'recommendations',
    timestamps: false, // We use 'generated_at' instead of createdAt/updatedAt
    indexes: [
      {
        name: 'idx_recommendations_source',
        fields: ['source_system', 'source_context_id'],
      },
    ],
  });
  return Recommendation;
};
