// server.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

let MongoMemoryServer;
try {
  MongoMemoryServer = require("mongodb-memory-server").MongoMemoryServer;
} catch (e) {
  MongoMemoryServer = null;
  console.warn("⚠️ mongodb-memory-server is not available:", e.message);
}

const { initWebSocket } = require("./websocket");

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

// MongoDB Connection
const connectMongo = async () => {
  const explicitUri = process.env.MONGO_URI?.trim();
  const localUri = process.env.MONGO_URI_LOCAL?.trim() || "mongodb://127.0.0.1:27017/ai_diet_planner";
  const connectOptions = {
    dbName: "ai_diet_planner",
  };

  const tryConnect = async (uri, label) => {
    await mongoose.connect(uri, connectOptions);
    console.log(`✅ MongoDB connected (${label}):`, uri);
  };

  if (explicitUri) {
    try {
      await tryConnect(explicitUri, "MONGO_URI");
      return;
    } catch (err) {
      console.error("❌ MongoDB connection error for MONGO_URI:", err.message || err);
    }
  } else {
    console.log("ℹ️ No MONGO_URI configured, trying local MongoDB...");
  }

  try {
    await tryConnect(localUri, "local MongoDB");
    return;
  } catch (localErr) {
    console.error("❌ Local MongoDB connection failed:", localErr.message || localErr);
  }

  if (process.env.NODE_ENV !== "production" && MongoMemoryServer && process.env.ALLOW_MEMORY_FALLBACK === "true") {
    try {
      console.log("ℹ️ Falling back to in-memory MongoDB for development...");
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri(), { dbName: "ai_diet_planner" });
      console.log("✅ Connected to in-memory MongoDB for development");
      return;
    } catch (memoryError) {
      console.error("❌ In-memory MongoDB startup failed:", memoryError);
    }
  }

  console.error(
    "❌ Unable to connect to any MongoDB instance. To persist users, start local MongoDB or set a valid MONGO_URI in server/.env.\n" +
    "If you want temporary in-memory fallback during development, set ALLOW_MEMORY_FALLBACK=true."
  );
  process.exit(1);
};

// Start server
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

connectMongo().then(() => {
  initWebSocket(server);
  server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
