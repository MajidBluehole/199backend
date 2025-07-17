module.exports = (sequelize, DataTypes) => {
  const InteractionParticipant = sequelize.define('InteractionParticipant', {
  interaction_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'interactions', // name of the target table
      key: 'interaction_id'
    },
    comment: 'Foreign key to the interactions table.'
  },
  contact_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'contacts', // name of the target table
      key: 'contact_id'
    },
    comment: 'Foreign key to the contacts table.'
  }
}, {
  sequelize,
  modelName: 'InteractionParticipant',
  tableName: 'interaction_participants',
  timestamps: true, // Enables createdAt and updatedAt
  underscored: true, // Use snake_case for column names and foreign keys
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  comment: 'Join table for interactions and contacts (participants).'
});
  return InteractionParticipant;
};
