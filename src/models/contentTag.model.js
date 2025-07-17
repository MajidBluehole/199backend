module.exports = (sequelize, DataTypes) => {
  const ContentTag = sequelize.define('ContentTag', {
  content_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'knowledge_content', // Name of the target table
      key: 'content_id',
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key for the content',
  },
  tag_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'tags', // Name of the target table
      key: 'tag_id',
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key for the tag',
  },
}, {
  sequelize,
  modelName: 'ContentTag',
  tableName: 'content_tags',
  timestamps: false, // Junction tables typically do not need timestamps
  comment: 'Junction table for the many-to-many relationship between content and tags.',
  indexes: [
    {
      name: 'idx_content_tags_tag_id',
      fields: ['tag_id'],
      using: 'BTREE',
    },
  ],
});
  return ContentTag;
};
