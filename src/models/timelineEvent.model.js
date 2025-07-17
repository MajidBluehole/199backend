const { DataTypes, Model } = require('sequelize');


module.exports = (sequelize) => {
  class TimelineEvent extends Model {
    
    static associate(models) {
      TimelineEvent.belongsTo(models.Organization, {
        foreignKey: 'organization_id',
        as: 'organization',
      });
    }
  }

  TimelineEvent.init({
    event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'organization_id',
      },
    },
    contact_identifier: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Email or other unique identifier for the customer/contact.',
    },
    source_system: {
      type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'ZENDESK', 'GMAIL'),
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "e.g., 'EMAIL_RECEIVED', 'TICKET_UPDATED', 'DEAL_STAGE_CHANGED'",
    },
    event_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    external_url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      comment: 'Direct link to the event in the source system.',
    },
  }, {
    sequelize,
    modelName: 'TimelineEvent',
    tableName: 'timeline_events',
    timestamps: false, // No createdAt/updatedAt columns
    indexes: [
      {
        name: 'idx_timeline_contact_time',
        using: 'BTREE',
        fields: ['organization_id', 'contact_identifier', 'event_time'],
      },
    ],
    comment: 'Aggregates events from all integrated systems for a unified customer timeline.',
  });

  return TimelineEvent;
};