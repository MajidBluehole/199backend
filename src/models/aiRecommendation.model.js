const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class AiRecommendation extends Model {
    
    static associate(models) {
      // define association here
      AiRecommendation.belongsTo(models.Interaction, {
        foreignKey: 'interaction_id',
        as: 'interaction',
      });
    }
  }

  AiRecommendation.init({
    recommendationId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: 'recommendation_id',
    },
    interactionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'interaction_id',
      references: {
        model: 'interactions', // This is a reference to another model/table
        key: 'interaction_id', // This is the column name of the referenced model
      },
    },
    type: {
      type: DataTypes.ENUM(
        'CREATE_SF_OPPORTUNITY',
        'CREATE_ZENDESK_TICKET',
        'SCHEDULE_FOLLOW_UP',
        'DRAFT_EMAIL',
        'CREATE_SF_TASK'
      ),
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'ACTION_TAKEN',
        'DISMISSED'
      ),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'AiRecommendation',
    tableName: 'ai_recommendations',
    timestamps: true, // Sequelize will manage createdAt and updatedAt
    underscored: true, // Use snake_case for column names in the database
  });

  return AiRecommendation;
};