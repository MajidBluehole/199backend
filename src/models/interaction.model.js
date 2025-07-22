module.exports = (sequelize, DataTypes) => {
  const Interaction = sequelize.define('Interaction', {
  interaction_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  contact_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'contacts',
      key: 'contact_id'
    }
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ANALYZING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'pending_analysis'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  external_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  source_service: {
    type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL', 'OUTLOOK', 'ZOOM', 'TEAMS', 'CALENDAR', 'RELAIVAINT_APP'),
    allowNull: true
  },
  interaction_type: {
    type: DataTypes.ENUM('CALL', 'EMAIL', 'MEETING', 'TICKET', 'NOTE'),
    allowNull: true
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Interaction',
  tableName: 'interactions',
  timestamps: true, // Enables createdAt
  updatedAt: false, // Disables updatedAt as it's not in the schema
  createdAt: 'created_at' // Map the model's createdAt to the 'created_at' column
});
  return Interaction;
};
