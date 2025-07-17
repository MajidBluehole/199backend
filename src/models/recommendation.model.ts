import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

// These are all the attributes in the Recommendation model
interface RecommendationAttributes {
  recommendation_id: string;
  source_system: string;
  source_context_id: string | null;
  recommendation_text: string;
  generated_at: Date;
}

// Some attributes are optional in `Recommendation.create` or `Recommendation.build` calls
interface RecommendationCreationAttributes extends Optional<RecommendationAttributes, 'recommendation_id' | 'generated_at'> {}

class Recommendation extends Model<RecommendationAttributes, RecommendationCreationAttributes> implements RecommendationAttributes {
  public recommendation_id!: string;
  public source_system!: string;
  public source_context_id!: string | null;
  public recommendation_text!: string;
  public readonly generated_at!: Date;
}

export const initRecommendationModel = (sequelize: Sequelize): typeof Recommendation => {
  Recommendation.init({
    recommendation_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    source_system: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    source_context_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    recommendation_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    sequelize,
    tableName: 'recommendations',
    timestamps: false, // We use 'generated_at' instead of createdAt/updatedAt
    indexes: [
      {
        name: 'idx_recommendations_source',
        fields: ['source_system', 'source_context_id'],
      },
    ],
  });

  return Recommendation;
};

export default Recommendation;
