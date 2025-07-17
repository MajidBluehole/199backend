module.exports = (sequelize, DataTypes) => {
  const StaticContent = sequelize.define('StaticContent', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('privacy_policy', 'terms_of_service', 'faq', 'about_us'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    publishedBy: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'StaticContents',
    timestamps: true
  });

  StaticContent.associate = models => {
    StaticContent.belongsTo(models.User, { foreignKey: 'publishedBy', as: 'publisher' });
  };

  return StaticContent;
};
