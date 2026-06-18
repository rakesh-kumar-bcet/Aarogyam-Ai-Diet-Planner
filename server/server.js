// server.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { initWebSocket } = require("./websocket");

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
});

// Routes
const authRoutes = require("./routes/auth");
const dietRoutes = require("./routes/diet");      
const calorieRoutes = require("./routes/calories");
const reportRoutes = require("./routes/report");  
const chatRoutes = require("./routes/chat");
// changed admin to nutrienist
const nutrenistRoutes = require("./routes/nutrenist");
const adminRoutes = require("./routes/admin");
const feedbackRoutes = require("./routes/feedback");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON request bodies

// Default route
app.get("/", (req, res) => {
  res.send("✅ AI Diet Planner API is running!");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/calories", calorieRoutes); // enable calorie tracking endpoints
app.use("/api/report", reportRoutes); // optional
app.use("/api/chat", chatRoutes);
app.use("/api/nutrenist", nutrenistRoutes); // renamed endpoint
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

// Global error handler for unexpected internal failures
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({
    message: err.message || "Server error",
    stack: err.stack,
  });
});

// MongoDB Connection
const connectMongo = async () => {
  const uri = process.env.MONGO_URI.trim();
  const connectOptions = { dbName: "ai_diet_planner" };

  try {
    await mongoose.connect(uri, connectOptions);
    console.log(`✅ MongoDB connected (MONGO_URI):`, uri);
  } catch (err) {
    console.error("❌ MongoDB connection error for MONGO_URI:", err.message || err);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

connectMongo().then(() => {
  initWebSocket(server);
  server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
