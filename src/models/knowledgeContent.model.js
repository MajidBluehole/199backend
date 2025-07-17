module.exports = (sequelize, DataTypes) => {
  const KnowledgeContent = sequelize.define('KnowledgeContent', 
    {
      content_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      uploader_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content_type: {
        type: DataTypes.ENUM('Sales Sheet', 'Technical Doc', 'Case Study', 'Presentation', 'Other'),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING(1024),
        allowNull: false,
        unique: 'uq_file_path',
      },
      file_size: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      file_mime_type: {
        type: DataTypes.STRING(127),
        allowNull: false,
      },
      view_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      download_count: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      upload_status: {
        type: DataTypes.ENUM('Uploading', 'Processing', 'Completed', 'Failed'),
        allowNull: false,
        defaultValue: 'Uploading',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'knowledge_content',
      timestamps: true,
      underscored: true,
      indexes: [
        { name: 'idx_content_uploader', fields: ['uploader_id'] },
        { name: 'idx_content_type', fields: ['content_type'] },
        { name: 'idx_content_full_text', fields: ['title', 'description'], type: 'FULLTEXT' },
      ],
    }
  );
  return KnowledgeContent;
};
