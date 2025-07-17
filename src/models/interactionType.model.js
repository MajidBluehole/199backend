module.exports = (sequelize, DataTypes) => {
  const InteractionType = sequelize.define('InteractionType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'interaction_types_name_unique',
        msg: 'Interaction type name must be unique.'
      }
    },
    iconName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'icon_name'
    },
    isDeletable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_deletable'
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'display_order'
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
    modelName: 'InteractionType',
    tableName: 'interaction_types',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: false, // We are explicitly mapping field names
    indexes: [
        {
            name: 'idx_interaction_types_name',
            using: 'BTREE',
            fields: ['name']
        },
        {
            name: 'idx_interaction_types_display_order',
            using: 'BTREE',
            fields: ['display_order']
        }
    ]
  });
  return InteractionType;
};
