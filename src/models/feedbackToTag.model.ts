import { Model, DataTypes, Sequelize } from 'sequelize';


export class FeedbackToTag extends Model {
  public feedback_id!: string;
  public tag_id!: number;

  
  public static associate(models: any) {
    // Defines the relationship to the Feedback model
    this.belongsTo(models.Feedback, {
      foreignKey: 'feedback_id',
      onDelete: 'CASCADE',
    });

    // Defines the relationship to the FeedbackTag model
    this.belongsTo(models.FeedbackTag, {
      foreignKey: 'tag_id',
      onDelete: 'CASCADE',
    });
  }
}


export default function (sequelize: Sequelize): typeof FeedbackToTag {
  FeedbackToTag.init(
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
}