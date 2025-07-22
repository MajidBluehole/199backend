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
const { Faq } = require("./Faq_Category")(sequelize, DataTypes);
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
const Recommendation = require("./recommendation.model.js")(sequelize, DataTypes);
const MasterCustomer = require("./masterCustomer.model.js")(sequelize, DataTypes);
const FilterOption = require("./filterOption.model.js")(sequelize, DataTypes);
const CustomFieldOption = require("./customFieldOption.model.js")(sequelize, DataTypes);
const DataSource = require("./dataSource.model.js")(sequelize, DataTypes);
const InsightModel = require("./insightModel.js")(sequelize, DataTypes);
const Curation = require("./curation.model.js")(sequelize, DataTypes);
const Tag = require("./tag.model.js")(sequelize, DataTypes);
const InteractionTranscript = require("./interactionTranscript.model.js")(sequelize, DataTypes);
const FeedbackTag = require("./feedbackTag.model.js")(sequelize, DataTypes);
const RecommendationWeight = require("./recommendationWeight.model.js")(sequelize, DataTypes);
const Keyword = require("./keyword.model.js")(sequelize, DataTypes);
const Integration = require("./integration.model.js")(sequelize, DataTypes);
const ContentHistory = require("./contentHistory.model.js")(sequelize, DataTypes);
const FieldMapping = require("./fieldMapping.model.js")(sequelize, DataTypes);
const InteractionParticipant = require("./interactionParticipant.model.js")(sequelize, DataTypes);
const KnowledgeContent = require("./knowledgeContent.model.js")(sequelize, DataTypes);
const CustomerSourceLink = require("./customerSourceLink.model.js")(sequelize, DataTypes);
const CustomField = require("./customField.model.js")(sequelize, DataTypes);
const Feedback = require("./feedback.model.js")(sequelize, DataTypes);
const ConnectedDataSource = require("./connectedDataSource.model.js")(sequelize, DataTypes);
const FeedbackToTag = require("./feedbackToTag.model.js")(sequelize, DataTypes);

// sequelize.sync({ alter: true })
//   .then(() => console.log("Tables synced"))
//   .catch((err) => console.error("Error syncing tables:", err));

// Organization associations
Organization.hasMany(User, { foreignKey: 'organization_id', as: 'users' });
User.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

Organization.hasMany(ConnectedSystem, { foreignKey: 'organization_id', as: 'connectedSystems' });
ConnectedSystem.belongsTo(Organization, { foreignKey: 'organization_id', as: 'organization' });

// Stripe associations
StripePaidSubscriptionModel.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

StripeSubscriptionHistoriesModel.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// AuthToken associations
User.hasMany(AuthToken, { foreignKey: 'userId', as: 'authTokens' });
AuthToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Announcement associations
Announcement.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Announcement.belongsTo(User, { foreignKey: 'updatedBy', as: 'editor' });
User.hasMany(Announcement, { foreignKey: 'createdBy', as: 'createdAnnouncements' });
User.hasMany(Announcement, { foreignKey: 'updatedBy', as: 'editedAnnouncements' });

// Contact associations
Contact.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Contact, { foreignKey: 'userId', as: 'contacts' });

// ContactForm associations
ContactForm.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ContactForm, { foreignKey: 'userId', as: 'contactForms' });

// CrashReport associations
CrashReport.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(CrashReport, { foreignKey: 'userId', as: 'crashReports' });

// Invoice associations
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Invoice.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });
Transaction.hasMany(Invoice, { foreignKey: 'transactionId', as: 'invoices' });

// Country associations
Country.hasMany(User, { foreignKey: 'countryId', as: 'users' });
User.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// LoginHistory associations
LoginHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(LoginHistory, { foreignKey: 'userId', as: 'loginHistories' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'receivedNotifications' });
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'createdNotifications' });

// StaticContent associations
StaticContent.belongsTo(User, { foreignKey: 'publishedBy', as: 'publisher' });
User.hasMany(StaticContent, { foreignKey: 'publishedBy', as: 'publishedContent' });

// Subscriber associations
Subscriber.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Subscriber, { foreignKey: 'userId', as: 'subscriptions' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

// Interaction associations
Interaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Interaction, { foreignKey: 'user_id', as: 'interactions' });
Interaction.belongsTo(Contact, { foreignKey: 'contact_id', as: 'contact' });
Contact.hasMany(Interaction, { foreignKey: 'contact_id', as: 'interactions' });

// Category and FAQ associations
Category.hasMany(Faq, { foreignKey: 'categoryId', as: 'faqs' });
Faq.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

module.exports = {
  sequelize,
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

