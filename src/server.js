require("dotenv").config();
const express = require("express");
const os = require("os");
const errorHandler = require("./middleware/errorHandler");
const packageJson = require("../package.json");
const db = require("./config/config");
const { addTagsToFeedback } = require('./controllers/feedbackTag.controller.js');
const { authenticate } = require('./middleware/auth');
const { createCustomField } = require('./controllers/customFields.controller.js');
const { createInteraction } = require('./controllers/interaction.controller.js');
const { createInteractionType } = require('./controllers/interactionTypes.controller.js');
const { deleteContent } = require('./controllers/knowledgeBase.controller.js');
const { deleteInteractionType } = require('./controllers/deleteInteractionType.controller.js');
const { getContentById } = require('./controllers/getContentById.js');
const { getCustomFields } = require('./controllers/getCustomFields.js');
const { getDesktopAppStatus } = require('./controllers/statusController.js');
const { getDownloadUrl } = require('./controllers/knowledgeContentController.js');
const { getFeedback } = require('./controllers/feedbackController.js');
const { getFeedbackContext } = require('./controllers/getFeedbackContextController.js');
const { getFeedbackFilters } = require('./controllers/getFeedbackFilters.js');
const { getFeedbackReasons } = require('./controllers/feedbackReasonsController.js');
const { getFeedbackSummary } = require('./controllers/analyticsController.js');
const { getFilterOptions } = require('./controllers/filterOptions.controller.js');
const { getInteractionTypesController } = require('./controllers/getInteractionTypesController.js');
const { getKnowledgeBaseFilters } = require('./controllers/knowledgeBaseFilters.controller.js');
const { getSystemConnections } = require('./controllers/systemConnectionsController.js');
const { handleUploadErrors } = require('./controllers/knowledgeContent.controller.js');
const { submitFeedback, removeTagFromFeedback } = require('./controllers/feedback.controller.js');
const { reorderItems } = require('./controllers/adminReorder.controller.js');
const { searchContacts } = require('./controllers/searchContacts.js');
const { searchKnowledgeContent } = require('./controllers/knowledgeContent.controller.js');
const { updateCustomField } = require('./controllers/adminCustomFieldsController.js');
const { updateFeedbackStatus } = require('./controllers/feedbackStatusController.js');
const { updateKnowledgeContent } = require('./controllers/updateKnowledgeContent.js');
const { uploadContent } = require('./controllers/knowledgeContent.controller.js');
const { uploadMiddleware } = require('./controllers/knowledgeContent.controller.js');
const { getAdminSummaryData } = require('./controllers/adminSummary.controller.js');

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const { sequelize, Country } = require("./models");
const seedCountries = require("./utils/seedCountries");

const corsOptions = {
  origin: 'https://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get('/check-session', (req, res) => {
  console.log('Cookies:', req.headers.cookie);
  console.log('Session:', req.session);
  res.json({ oauthTokenSecret: req.session.oauthTokenSecret });
});

// ✅ Route Groups (add these files as needed)
app.use("/api/auth", require("./routes/auth"));
//mobile login api
//web login api
app.use("/api/auth", require("./routes/webLoginRoutes"));

app.use("/api/google", require("./routes/googleRoutes"));
app.use("/api/public", require("./routes/public"));
app.use("/api/user", require("./routes/user"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/stripe-payment-subscriptions", require("./routes/stripePaymentSubscriptionsRoutes"));
app.use("/api/faq", require("./routes/faq"));
// === Controller Routes (auto-generated) ===
// app.get('/api/v1/admin/interaction-types', authenticate, getInteractionTypesController);
// === Interactions ===
app.post('/api/v1/interactions', authenticate, createInteraction);
app.get('/api/v1/admin/interaction-types', authenticate, getInteractionTypesController.handleRequest);
app.post('/api/v1/admin/interaction-types', authenticate, createInteractionType);
app.delete('/api/v1/admin/interaction-types/:id', authenticate, deleteInteractionType);

// === Contacts ===
app.get('/api/v1/contacts/search', authenticate, searchContacts);

// === System ===
app.get('/api/v1/system/connections', authenticate, getSystemConnections);
app.get('/api/v1/status/desktop-app', authenticate, getDesktopAppStatus);

// === Feedback ===
app.get('/api/v1/feedback/reasons', authenticate, getFeedbackReasons);
app.get('/api/v1/feedback/context/:recommendation_id', authenticate, getFeedbackContext);
app.get('/api/v1/feedback', authenticate, getFeedback);
app.post('/api/v1/feedback', authenticate, submitFeedback);
app.delete('/api/v1/feedback/:feedbackId/tags/:tagId', authenticate, removeTagFromFeedback);
app.patch('/api/v1/feedback/status', authenticate, updateFeedbackStatus);
app.get('/api/v1/feedback/filters', authenticate, getFeedbackFilters);
app.post('/api/v1/feedback/tags', authenticate, addTagsToFeedback);

// === Analytics ===
app.get('/api/v1/analytics/feedback/summary', authenticate, getFeedbackSummary);

// === Knowledge Base ===
app.get('/api/v1/knowledge-base/filters', authenticate, getKnowledgeBaseFilters);
app.get('/api/v1/knowledge-base/content', authenticate, searchKnowledgeContent);
app.get('/api/v1/knowledge-base/content/:contentId', authenticate, getContentById);
app.put('/api/v1/knowledge-base/content/:contentId', authenticate, updateKnowledgeContent);
app.delete('/api/v1/knowledge-base/content/:contentId', authenticate, deleteContent);
app.get('/api/v1/knowledge-base/content/:contentId/download', authenticate, getDownloadUrl);

// File upload-related routes (ensure middleware order is correct)
app.post('/api/v1/knowledge-base/content', authenticate, uploadMiddleware, handleUploadErrors, uploadContent);

// === Admin - Custom Fields & Filters ===
app.get('/api/v1/admin/custom-fields', authenticate, getCustomFields);
app.post('/api/v1/admin/custom-fields', authenticate, createCustomField);
app.put('/api/v1/admin/custom-fields/:id', authenticate, updateCustomField);
app.get('/api/v1/admin/filter-options', authenticate, getFilterOptions);
app.post('/api/v1/admin/:itemType/reorder', authenticate, reorderItems);

// === Admin Summary Data ===
app.get('/api/v1/content', authenticate, getAdminSummaryData);

sequelize.sync({ alter: true }).then(async () => {
  console.log("✅ DB synced");
  // Seed countries
  await seedCountries(Country);

}).catch(err => {
  console.error("❌ Error syncing DB:", err);
});
// ✅ Health Check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Success" });
});

app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.status(200).json({
      message: "Server is running ✅",
      dbStatus: "Connected to MySQL ✅",
      environment: process.env.NODE_ENV || "development",
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      hostname: os.hostname()
    });
  } catch (error) {
    res.status(500).json({ message: "DB Error ❌", error: error.message });
  }
});

// 🔴 Register the global error handler LAST
app.use(errorHandler);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
