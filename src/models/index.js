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
  sequelize,
  User,
  Announcement,
  AuthToken,
  ContactForm,
  CrashReport,
  Invoice,
  LoginHistory,
  Notification,
  Setting,
  StaticContent,
  Subscriber,
  Transaction,
  Faq,
  StripeSubscriptionModel,
  StripeSubscriptionHistoriesModel,
  StripePaidSubscriptionModel,
  Category,
  Country
};

