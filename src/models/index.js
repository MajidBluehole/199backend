const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log,
});

const User = require("./User")(sequelize, DataTypes)
const Announcement = require("./announcement")(sequelize, DataTypes);
const AuthToken = require("./authtoken")(sequelize, DataTypes);
const ContactForm = require("./contactForm")(sequelize, DataTypes);
const CrashReport = require("./crashReport")(sequelize, DataTypes);
const Invoice = require("./invoice")(sequelize, DataTypes);
const Country = require("./countryModel")(sequelize, DataTypes);
const LoginHistory = require("./loginHistory")(sequelize, DataTypes);
const Notification = require("./notification")(sequelize, DataTypes);
// stripe one time product models
// stripe subscription models
const StripeSubscriptionModel = require("./stripe_subscriptionModel")(sequelize, DataTypes);
const StripeSubscriptionHistoriesModel = require("./stripe_subscription_historiesModel")(sequelize, DataTypes);
const StripePaidSubscriptionModel = require("./stripe_paid_subscriptionModel")(sequelize, DataTypes);


const Setting = require("./setting")(sequelize, DataTypes);
const StaticContent = require("./staticContent")(sequelize, DataTypes);
const Subscriber = require("./subscriber")(sequelize, DataTypes);
const Transaction = require("./transaction")(sequelize, DataTypes);
const { Category, Faq } = require("./Faq_Category")(sequelize, DataTypes);
const Organization = require("./organization.model.js")(sequelize, DataTypes);
const AiRecommendation = require("./aiRecommendation.model.js")(sequelize, DataTypes);
const FeedbackReason = require("./feedbackReason.model.js")(sequelize, DataTypes);
const ContentTag = require("./contentTag.model.js")(sequelize, DataTypes);
const Interaction = require("./interaction.model.js")(sequelize, DataTypes);
const ConnectedSystem = require("./connectedSystem.model.js")(sequelize, DataTypes);
const Content = require("./content.model.js")(sequelize, DataTypes);
const AiAnalysis = require("./aiAnalysis.model.js")(sequelize, DataTypes);
const Contact = require("./contact.model.js")(sequelize, DataTypes);
const Category = require("./category.model.js")(sequelize, DataTypes);
const TimelineEvent = require("./timelineEvent.model.js")(sequelize, DataTypes);
const FeedbackSubmission = require("./feedbackSubmission.model.js")(sequelize, DataTypes);
const UserIntegration = require("./user_integration.model.js")(sequelize, DataTypes);
const InteractionType = require("./interactionType.model.js")(sequelize, DataTypes);
const Recommendation = require("./recommendation.model.ts")(sequelize, DataTypes);
const MasterCustomer = require("./masterCustomer.model.js")(sequelize, DataTypes);
const FilterOption = require("./filterOption.model.js")(sequelize, DataTypes);
const CustomFieldOption = require("./customFieldOption.model.js")(sequelize, DataTypes);
const DataSource = require("./dataSource.model.js")(sequelize, DataTypes);
const InsightModel = require("./insightModel.js")(sequelize, DataTypes);
const Curation = require("./curation.model.js")(sequelize, DataTypes);
const Tag = require("./tag.model.ts")(sequelize, DataTypes);
const InteractionTranscript = require("./interactionTranscript.model.js")(sequelize, DataTypes);
const FeedbackTag = require("./feedbackTag.model.js")(sequelize, DataTypes);
const RecommendationWeight = require("./recommendationWeight.model.js")(sequelize, DataTypes);
const Keyword = require("./keyword.model.js")(sequelize, DataTypes);
const Integration = require("./integration.model.js")(sequelize, DataTypes);
const ContentHistory = require("./contentHistory.model.js")(sequelize, DataTypes);
const FieldMapping = require("./fieldMapping.model.js")(sequelize, DataTypes);
const InteractionParticipant = require("./interactionParticipant.model.js")(sequelize, DataTypes);
const KnowledgeContent = require("./knowledgeContent.model.ts")(sequelize, DataTypes);
const CustomerSourceLink = require("./customerSourceLink.model.js")(sequelize, DataTypes);
const CustomField = require("./customField.model.ts")(sequelize, DataTypes);
const Feedback = require("./feedback.model.js")(sequelize, DataTypes);
const ConnectedDataSource = require("./connectedDataSource.model.js")(sequelize, DataTypes);
const FeedbackToTag = require("./feedbackToTag.model.ts")(sequelize, DataTypes);

// sequelize.sync({ alter: true })
//   .then(() => console.log("Tables synced"))
//   .catch((err) => console.error("Error syncing tables:", err));
// Assuming you load models into `db`
StripePaidSubscriptionModel.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

  StripeSubscriptionHistoriesModel.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });


module.exports = {
  AiAnalysis,
  AiRecommendation,
  Announcement,
  AuthToken,
  Category,
  ConnectedDataSource,
  ConnectedSystem,
  Contact,
  ContactForm,
  Content,
  ContentHistory,
  ContentTag,
  Country,
  CrashReport,
  Curation,
  CustomField,
  CustomFieldOption,
  CustomerSourceLink,
  DataSource,
  Faq,
  Feedback,
  FeedbackReason,
  FeedbackSubmission,
  FeedbackTag,
  FeedbackToTag,
  FieldMapping,
  FilterOption,
  InsightModel,
  Integration,
  Interaction,
  InteractionParticipant,
  InteractionTranscript,
  InteractionType,
  Invoice,
  Keyword,
  KnowledgeContent,
  LoginHistory,
  MasterCustomer,
  Notification,
  Organization,
  Recommendation,
  RecommendationWeight,
  Setting,
  StaticContent,
  StripePaidSubscriptionModel,
  StripeSubscriptionHistoriesModel,
  StripeSubscriptionModel,
  Subscriber,
  Tag,
  TimelineEvent,
  Transaction,
  User,
  UserIntegration,
};

