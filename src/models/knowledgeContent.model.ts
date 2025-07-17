import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// We recommend you declare an interface for your model's attributes
interface KnowledgeContentAttributes {
  content_id: string;
  uploader_id: string;
  title: string;
  description: string | null;
  content_type: 'Sales Sheet' | 'Technical Doc' | 'Case Study' | 'Presentation' | 'Other';
  file_name: string;
  file_path: string;
  file_size: number;
  file_mime_type: string;
  view_count: number;
  download_count: number;
  upload_status: 'Uploading' | 'Processing' | 'Completed' | 'Failed';
  readonly created_at: Date;
  readonly updated_at: Date;
}

// Some attributes are optional in `Model.create()` or `Model.build()`
interface KnowledgeContentCreationAttributes extends Optional<KnowledgeContentAttributes, 'content_id' | 'description' | 'view_count' | 'download_count' | 'upload_status' | 'created_at' | 'updated_at'> {}

export class KnowledgeContent extends Model<KnowledgeContentAttributes, KnowledgeContentCreationAttributes> implements KnowledgeContentAttributes {
  public content_id!: string;
  public uploader_id!: string;
  public title!: string;
  public description!: string | null;
  public content_type!: 'Sales Sheet' | 'Technical Doc' | 'Case Study' | 'Presentation' | 'Other';
  public file_name!: string;
  public file_path!: string;
  public file_size!: number;
  public file_mime_type!: string;
  public view_count!: number;
  public download_count!: number;
  public upload_status!: 'Uploading' | 'Processing' | 'Completed' | 'Failed';

  // timestamps!
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static associate(models: any) {
    // define association here
    this.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader' });
  }
}

export default function (sequelize: Sequelize): typeof KnowledgeContent {
  KnowledgeContent.init(
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
}
