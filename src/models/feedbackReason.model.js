const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Assuming a central db config file

class FeedbackReason extends Model {}

FeedbackReason.init({
  reasonId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'reason_id'
  },
  reasonText: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'uk_feedback_reasons_reason_text',
      msg: 'This reason text is already in use.'
    },
    field: 'reason_text'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  sequelize,
  modelName: 'FeedbackReason',
  tableName: 'feedback_reasons',
  timestamps: false // No createdAt/updatedAt columns as per the definition
});

module.exports = FeedbackReason;