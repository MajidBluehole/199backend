module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onDelete: 'CASCADE'
    },
    invoiceNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'issued', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'issued'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    dueDate: {
      type: DataTypes.DATE
    },
    paidAt: {
      type: DataTypes.DATE
    },
    transactionId: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: 'Transactions',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    notes: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'Invoices',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['invoiceNumber'] }
    ]
  });

  return Invoice;
};
