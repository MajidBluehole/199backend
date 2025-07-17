module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    categoryId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'category_id'
    },
    category_text: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'uk_categories_name',
        msg: 'Category name must be unique.'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'categories',
    timestamps: true,
    underscored: true
  });

  const Faq = sequelize.define('Faq', {
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sr_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    categoryId: {
      type: DataTypes.UUID, // ✅ FIXED: Matches Category PK type
      allowNull: false,
    },
  }, {
    tableName: 'faqs',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['categoryId', 'sr_no'],
      },
    ],
  });



  return { Category, Faq };
};
