module.exports = (sequelize, DataTypes) => {
  const ContentHistory = sequelize.define('ContentHistory', {
    history_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    content_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'content',
        key: 'content_id',
      },
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    change_author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    saved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'ContentHistory',
    tableName: 'content_history',
    timestamps: false, // We are using a custom `saved_at` field
    indexes: [
      {
        name: 'idx_content_history_content_version',
        fields: ['content_id', 'version'],
        using: 'BTREE',
      },
    ],
  });
  return ContentHistory;
};
