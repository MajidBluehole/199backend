const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FeedbackSubmission extends Model {
    
    static associate(models) {
      // Assumes User, Recommendation, and FeedbackReason models exist
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(models.Recommendation, { foreignKey: 'recommendationId', as: 'recommendation' });
      this.belongsTo(models.FeedbackReason, { foreignKey: 'reasonId', as: 'reason' });
    }
  }

  FeedbackSubmission.init({
    feedbackId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'feedback_id'
    },
    userId: {
      type: DataTypes.UUID,
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
      type: DataTypes.ENUM('thumbs', 'stars'),
      allowNull: false,
      field: 'rating_type'
    },
    ratingValue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'rating_value'
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
      type: DataTypes.ENUM('synced', 'pending_sync'),
      allowNull: false,
      defaultValue: 'synced',
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