module.exports = (sequelize, DataTypes) => {
  const FeedbackTag = sequelize.define('FeedbackTag', {
  tagId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'tag_id'
  },
  tagName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'tag_name'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
}, {
  sequelize,
  modelName: 'FeedbackTag',
  tableName: 'feedback_tags',
  timestamps: true, // This enables the automatic management of createdAt and updatedAt
  underscored: true // This maps camelCase model fields to snake_case table columns
});
  return FeedbackTag;
};
