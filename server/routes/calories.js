const express = require("express");
const CalorieLog = require("../models/CalorieLog");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// POST /api/calories/log - Add a calorie log
router.post("/log", authMiddleware.verifyToken, async (req, res) => {
  try {
    const { meal, calories } = req.body;
    const userId = req.user.id;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const log = new CalorieLog({ userId, date: new Date(date), meal, calories });
    await log.save();

    res.json({ message: "Calorie log added", log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add log" });
  }
});

// GET /api/calories/logs - Get logs for today
router.get("/logs", authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date().toISOString().split('T')[0];
    const logs = await CalorieLog.find({ userId, date: new Date(date) }).sort({ createdAt: -1 });
    const total = logs.reduce((sum, log) => sum + log.calories, 0);
    res.json({ logs, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;