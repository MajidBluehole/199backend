module.exports = (sequelize, DataTypes) => {
  const Curation = sequelize.define('Curation', {
    curation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    content_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'content', // This is a reference to another model/table
        key: 'content_id', // This is the column name of the referenced model
      },
    },
    rank_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Curation',
    tableName: 'curation',
    timestamps: true, // Enables createdAt and updatedAt
    createdAt: false, // We don't have a created_at column
    updatedAt: 'updated_at', // Map the updatedAt field to the 'updated_at' column
  });
  return Curation;
};
