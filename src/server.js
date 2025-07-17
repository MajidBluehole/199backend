require("dotenv").config();
const express = require("express");
const os = require("os");
const errorHandler = require("./middleware/errorHandler");
const packageJson = require("../package.json");
const db = require("./config/config");

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
