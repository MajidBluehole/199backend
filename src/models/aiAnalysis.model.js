module.exports = (sequelize, DataTypes) => {
  const AiAnalysis = sequelize.define('AiAnalysis', {
    analysis_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    interaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'interactions', // This is a reference to another model/table
        key: 'interaction_id', // This is the column name of the referenced model
      },
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // created_at and updated_at are handled by Sequelize's timestamps option
  }, {
    sequelize,
    modelName: 'AiAnalysis',
    tableName: 'ai_analyses',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // Use snake_case for column names (e.g., created_at, updated_at)
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return AiAnalysis;
};
