const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); // Assuming a sequelize instance is exported from here

class InteractionTranscript extends Model {}

InteractionTranscript.init({
  transcriptId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Unique identifier for the transcript segment',
  },
  interactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'interactions', // This is a reference to another model/table
      key: 'interaction_id',
    },
    comment: 'Foreign key linking to the parent interaction',
  },
  speakerIdentifier: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Identifier for the speaker (e.g., name, email)',
  },
  startTimeSeconds: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'The start time of the segment in seconds from the beginning of the interaction',
  },
  endTimeSeconds: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'The end time of the segment in seconds from the beginning of the interaction',
    validate: {
      isAfterStart(value) {
        if (value < this.startTimeSeconds) {
          throw new Error('End time must be greater than or equal to start time.');
        }
      },
    },
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'The transcribed text of the segment',
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Flag indicating if the transcript has been manually edited',
  },
}, {
  sequelize,
  modelName: 'InteractionTranscript',
  tableName: 'interaction_transcripts',
  timestamps: true,      // Enables createdAt and updatedAt fields
  underscored: true,     // Maps camelCase in model to snake_case in the database
  comment: 'Stores individual segments of a conversation transcript for an interaction.',
  indexes: [
    {
      name: 'idx_transcripts_interaction_id',
      using: 'BTREE',
      fields: ['interaction_id'],
    },
    {
      name: 'idx_transcripts_text_search',
      type: 'FULLTEXT',
      fields: ['text'],
    },
  ],
});

module.exports = InteractionTranscript;
