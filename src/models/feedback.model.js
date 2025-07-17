module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    feedback_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users', // Table name for the User model
        key: 'user_id',
      },
      onDelete: 'SET NULL',
    },
    recommendation_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recommendation_category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    feedback_type: {
      type: DataTypes.ENUM('helpful', 'not_helpful', 'incorrect'),
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('new', 'reviewed', 'actioned'),
      allowNull: false,
      defaultValue: 'new',
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    tableName: 'feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // No 'updated_at' column in the schema
    indexes: [
        { name: 'idx_feedback_user_id', fields: ['user_id'] },
        { name: 'idx_feedback_created_at', fields: ['created_at'] },
        { name: 'idx_feedback_type_status', fields: ['feedback_type', 'status'] },
        // FULLTEXT index is not supported directly via Sequelize model definitions for all dialects.
        // It is best managed through a raw SQL migration, as provided.
    ],
  });
  return Feedback;
};
