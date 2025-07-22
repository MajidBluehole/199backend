module.exports = (sequelize, DataTypes) => {
  const FeedbackSubmission = sequelize.define('FeedbackSubmission', {
    feedbackId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'feedback_id'
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      field: 'user_id'
    },
    recommendationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'recommendations',
        key: 'recommendation_id'
      },
      field: 'recommendation_id'
    },
    ratingType: {
      type: DataTypes.ENUM('positive', 'negative'),
      allowNull: false,
      field: 'rating_type'
    },
    reasonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'feedback_reasons',
        key: 'reason_id'
      },
      field: 'reason_id'
    },
    customReasonText: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'custom_reason_text'
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submissionStatus: {
      type: DataTypes.ENUM('submitted', 'synced', 'pending_sync'),
      allowNull: false,
      defaultValue: 'submitted',
      field: 'submission_status'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
  }, {
    sequelize,
    modelName: 'FeedbackSubmission',
    tableName: 'feedback_submissions',
    timestamps: true, // Enables createdAt
    updatedAt: false, // Disables updatedAt as it's not in the schema
    underscored: true // Maps camelCase in the model to snake_case in the DB
  });
  return FeedbackSubmission;
};
