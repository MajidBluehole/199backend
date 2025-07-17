module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define(
    "StripePaidSubscription",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },      
      stripe_subscription_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      plan_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      billing_cycle_anchor: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trial_end: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      items: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "StripePaidSubscription",
      tableName: "stripe_paid_subscriptions",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'price_id', 'plan_id'],
        },
      ],
    }
  );

  Subscription.addHook("beforeSave", (subscription, options) => {
    subscription.updated_at = new Date();
  });

  return Subscription;
};
