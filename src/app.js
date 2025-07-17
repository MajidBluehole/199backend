const express = require("express");
const userRoutes = require("./routes/index");

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

module.exports = app; // ✅ Only exporting app, not starting server here
