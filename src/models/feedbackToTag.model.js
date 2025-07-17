module.exports = (sequelize, DataTypes) => {
  const FeedbackToTag = sequelize.define('FeedbackToTag', 
    {
      feedback_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        comment: 'Foreign key for the feedback item.',
        references: {
          model: 'feedback',
          key: 'feedback_id',
        },
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        comment: 'Foreign key for the tag.',
        references: {
          model: 'feedback_tags',
          key: 'tag_id',
        },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'feedback_to_tags',
      sequelize,
      timestamps: false, // This table does not need createdAt/updatedAt fields
      comment: 'Many-to-many join table linking feedback items to tags.',
      indexes: [
        {
          name: 'idx_feedback_to_tags_tag_id',
          using: 'BTREE',
          fields: ['tag_id'],
        },
      ],
    }
  );
  return FeedbackToTag;
};
