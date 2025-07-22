module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    orderId: {
      type: DataTypes.STRING
    },
    externalTransactionId: {
      type: DataTypes.STRING
    },
    provider: {
      type: DataTypes.ENUM('stripe', 'paypal', 'razorpay', 'square', 'manual'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('initiated', 'pending', 'success', 'failed', 'refunded', 'cancelled'),
      defaultValue: 'initiated'
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    amountPaid: {
      type: DataTypes.DECIMAL(10, 2)
    },
    amountRefunded: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    paymentMethodType: {
      type: DataTypes.STRING
    },
    cardLast4: {
      type: DataTypes.STRING
    },
    cardBrand: {
      type: DataTypes.STRING
    },
    customerId: {
      type: DataTypes.STRING
    },
    paymentIntentId: {
      type: DataTypes.STRING
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isTest: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    metadata: {
      type: DataTypes.JSON
    },
    errorMessage: {
      type: DataTypes.TEXT
    },
    paidAt: {
      type: DataTypes.DATE
    },
    refundedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Transactions',
    timestamps: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['orderId'] },
      { fields: ['provider', 'status'] },
      { fields: ['paidAt'] }
    ]
  });

  return Transaction;
};
