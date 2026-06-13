// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  console.log("REQ.BODY:", req.body); // Debug
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already used" });

    const validPublicRoles = ["user", "nutrenist"];
    let userRole = "user";

    if (validPublicRoles.includes(role)) {
      userRole = role;
    }

    if (role === "admin") {
      const adminSecret = req.headers["x-admin-secret"] || req.body.adminSecret;
      if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Admin registration requires a secure server secret" });
      }
      userRole = "admin";
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: userRole });

    // include role so that protected middleware can verify
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, userId: user._id, name: user.name, role: user.role });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// COMPLETE NUTRITIONIST PROFILE
router.post("/complete-nutritionist-profile", async (req, res) => {
  try {
    const { userId, degree, specialization, phone, contactPreference } = req.body;
    if (!userId || !degree || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "nutrenist") {
      return res.status(404).json({ message: "Nutritionist not found" });
    }

    user.degree = degree;
    user.specialization = specialization || null;
    user.phone = phone;
    user.contactPreference = contactPreference || ['chat'];
    user.isProfileComplete = true;

    await user.save();

    res.json({ message: "Profile completed successfully", user });
  } catch (err) {
    console.error("Profile completion error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Admin users must sign in via the hidden admin login page" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "1d" });

    // Log login
    await LoginLog.create({
      userId: user._id,
      action: 'login',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, weight: user.weight }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// UPDATE PROFILE (authenticated) - allows updating name, phone, weight
router.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, weight } = req.body;
    if (typeof name === 'string') user.name = name;
    if (typeof phone === 'string') user.phone = phone;
    if (weight !== undefined) {
      const parsed = Number(weight);
      user.weight = Number.isNaN(parsed) ? user.weight : parsed;
    }

    await user.save();

    res.json({ message: 'Profile updated', user: { _id: user._id, name: user.name, email: user.email, role: user.role, weight: user.weight } });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// ADMIN LOGIN - hidden admin authentication endpoint
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid admin credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "1d" });

    await LoginLog.create({
      userId: user._id,
      action: 'login',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Admin login failed" });
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    // Assuming token is sent in header or body, but since logout is client-side, maybe just log if userId provided
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await LoginLog.create({
        userId: decoded.id,
        action: 'logout',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
