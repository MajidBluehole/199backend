module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    category_text: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    timestamps: true,
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['categoryId', 'sr_no'],
      },
    ],
  });

  // Define associations
  Category.hasMany(Faq, { foreignKey: 'categoryId', as: 'faqs' });
  Faq.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  return { Category, Faq };
};
