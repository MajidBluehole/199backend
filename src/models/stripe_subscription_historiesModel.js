module.exports = (sequelize, DataTypes) => {
    const SubscriptionHistory = sequelize.define(
      "SubscriptionHistory",
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        user_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
        },        
        stripe_subscription_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        price_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        plan_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        modelName: "StripeSubscriptionHistory",
        tableName: "stripe_subscription_histories",
        timestamps: false,
      }
    );
  
    SubscriptionHistory.addHook("beforeSave", (subscriptionHistory) => {
      subscriptionHistory.updated_at = new Date();
    });
  
    return SubscriptionHistory;
  };
  