module.exports = (sequelize, DataTypes) => {
  const ContactForm = sequelize.define('ContactForm', {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING
    },
    subject: {
      type: DataTypes.STRING
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('support', 'feedback', 'bug_report', 'business', 'general'),
      defaultValue: 'general'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: "users",
        key: 'user_id'
      },
      onDelete: 'SET NULL',
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.TEXT
    },
    receivedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    resolvedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'ContactForms',
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['receivedAt'] }
    ]
  });


  return ContactForm;
};
