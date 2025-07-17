module.exports = (sequelize, DataTypes) => {
  const StripeSubscription = sequelize.define("StripeSubscription", {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    stripe_product_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    stripe_price_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    interval: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    interval_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },    
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "stripe_subscriptions",
    timestamps: false, // disable Sequelize's automatic timestamps (createdAt/updatedAt)
    underscored: true,
  });

  return StripeSubscription;
};
