module.exports = (sequelize, DataTypes) => {
  const Content = sequelize.define('Content', {
    content_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content_type: {
      type: DataTypes.ENUM('ARTICLE', 'UPDATE', 'TEMPLATE'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'PENDING_REVIEW'),
      allowNull: false,
      defaultValue: 'DRAFT'
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'category_id'
      }
    },
    submitted_by_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    template_variables: {
      type: DataTypes.JSON,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    view_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    edit_lock_token: {
      type: DataTypes.UUID,
      allowNull: true
    },
    edit_lock_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    locked_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Content',
    tableName: 'content',
    underscored: true, // Maps camelCase in the model to snake_case in the database
    timestamps: true, // Enables createdAt and updatedAt fields
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { name: 'idx_content_type', fields: ['content_type'] },
        { name: 'idx_content_status', fields: ['status'] },
        { name: 'idx_content_popularity', fields: [{ name: 'view_count', order: 'DESC' }, { name: 'published_at', order: 'DESC' }] },
        { name: 'idx_content_fulltext', fields: ['title', 'body'], type: 'FULLTEXT' }
    ]
  });
  return Content;
};
