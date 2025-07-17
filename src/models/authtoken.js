module.exports = (sequelize, DataTypes) => {
  const AuthToken = sequelize.define('AuthToken', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'AuthTokens',
    timestamps: true,
    createdAt: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] }
    ]
  });

  AuthToken.associate = models => {
    AuthToken.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AuthToken;
};
