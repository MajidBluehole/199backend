import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// We recommend creating a central sequelize instance and importing it here
// import sequelize from '../config/database'; 

// This is a placeholder for the real sequelize instance
const sequelize = new Sequelize('mysql::memory:'); 


interface TagAttributes {
  tagId: string;
  tagName: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}


interface TagCreationAttributes extends Optional<TagAttributes, 'tagId' | 'createdAt' | 'updatedAt'> {}


class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
  public tagId!: string;
  public tagName!: string;
  public name!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tag.init(
  {
    tagId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'tag_id',
      comment: 'Unique identifier for the tag, UUID format.',
    },
    tagName: {
      type: new DataTypes.STRING(100),
      allowNull: false,
      unique: 'idx_tags_name_unique',
      field: 'tag_name',
      comment: 'The unique, human-readable identifier for the tag (e.g., node-js, machine-learning).',
    },
    name: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      unique: 'uk_tags_name',
      field: 'name',
      comment: 'The display name of the tag (e.g., Node.js, Machine Learning).',
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
  },
  {
    sequelize,
    tableName: 'tags',
    timestamps: true,      // Enables createdAt and updatedAt fields
    underscored: true,     // Use snake_case for column names in the database
  }
);

export default Tag;
