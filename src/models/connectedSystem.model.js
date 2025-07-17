const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class ConnectedSystem extends Model {
    
    static associate(models) {
      // Assuming a 'Workspace' model exists and is passed in the 'models' object
      this.belongsTo(models.Workspace, {
        foreignKey: 'workspace_id',
        as: 'workspace',
      });
    }
  }

  ConnectedSystem.init({
    system_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    workspace_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workspaces', // This is a reference to another model/table
        key: 'workspace_id',
      },
    },
    system_type: {
      type: DataTypes.ENUM('SALESFORCE', 'HUBSPOT', 'GMAIL', 'OUTLOOK', 'ZENDESK', 'ZOOM', 'TEAMS'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('CONNECTED', 'DISCONNECTED', 'ERROR', 'SYNCING'),
      allowNull: false,
      defaultValue: 'DISCONNECTED',
    },
    last_synced_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ConnectedSystem',
    tableName: 'connected_systems',
    timestamps: true, // Enables createdAt and updatedAt
    underscored: true, // Use snake_case for DB columns
    indexes: [
      {
        name: 'idx_connected_systems_workspace_id',
        fields: ['workspace_id'],
      },
    ],
  });

  return ConnectedSystem;
};
