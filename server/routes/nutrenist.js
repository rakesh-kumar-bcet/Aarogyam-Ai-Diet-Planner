const express = require("express");
const User = require("../models/User");
const LoginLog = require("../models/LoginLog");
const DietHistory = require("../models/DietHistory");
const Feedback = require("../models/Feedback");
const ContactRequest = require("../models/ContactRequest");
const { sendToUser } = require("../websocket");
const router = express.Router();

// IMPORT JWT MIDDLEWARE
// use middleware folder path
const { verifyToken, nutrenistOnly } = require("../middleware/authMiddleware");

// ✅ NUTRENIST PROTECTED ROUTE
router.get("/users", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role'); // exclude password
    // Check which users have diet plans
    const userIds = users.map(u => u._id);
    const dietUsers = await DietHistory.distinct('user', { user: { $in: userIds } });
    const dietUserSet = new Set(dietUsers.map(id => id.toString()));
    const usersWithDietStatus = users.map(user => ({
      ...user.toObject(),
      hasDietPlan: dietUserSet.has(user._id.toString())
    }));
    res.json(usersWithDietStatus);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.put("/users/:id/role", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'nutrenist'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Role updated", user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get login activity logs
router.get("/login-logs", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const logs = await LoginLog.find().populate('userId', 'name email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get users who have diet plans (diet followers)
router.get("/diet-followers", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const userIds = await DietHistory.distinct('user');
    const dietUsers = await User.find({ _id: { $in: userIds } }, 'name email role');
    res.json(dietUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get contact requests for the logged-in nutritionist
router.get("/contact-requests", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const requests = await ContactRequest.find({ nutritionistId: req.user.id })
      .sort({ timestamp: -1 })
      .populate('userId', 'name email');

    res.json(requests.map((request) => ({
      id: request._id,
      user: request.userId,
      message: request.message,
      contactMethod: request.contactMethod,
      status: request.status,
      response: request.response,
      responseAt: request.responseAt,
      resolved: request.resolved,
      timestamp: request.timestamp
    })));
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Nutritionist responds to a contact request
router.post("/contact-requests/:id/respond", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const { response, resolved } = req.body;
    const requestId = req.params.id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ message: "Response text is required" });
    }

    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) {
      return res.status(404).json({ message: "Contact request not found" });
    }
    if (contactRequest.nutritionistId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    const nutritionist = await User.findById(req.user.id);
    contactRequest.messages.push({
      sender: 'nutritionist',
      senderName: nutritionist?.name || 'Nutritionist',
      text: response.trim(),
      timestamp: new Date(),
    });
    contactRequest.response = response.trim();
    contactRequest.responseAt = new Date();
    contactRequest.resolved = Boolean(resolved);
    contactRequest.status = contactRequest.resolved ? 'resolved' : 'answered';

    await contactRequest.save();

    sendToUser(contactRequest.userId.toString(), 'contact_response', {
      requestId: contactRequest._id,
      nutritionistId: req.user.id,
      response: contactRequest.response,
      status: contactRequest.status,
      resolved: contactRequest.resolved,
      messages: contactRequest.messages,
      timestamp: contactRequest.responseAt,
    });

    res.json({ message: "Response submitted successfully", request: contactRequest });
  } catch (error) {
    console.error('Error responding to contact request:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get feedback for the logged-in nutritionist
router.get("/feedback", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ nutritionistId: req.user.id })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    res.json(feedbacks.map((feedback) => ({
      _id: feedback._id,
      patientName: feedback.userId?.name || 'Anonymous Patient',
      patientEmail: feedback.userId?.email || '',
      rating: feedback.rating,
      comment: feedback.comment,
      timestamp: feedback.timestamp,
    })));
  } catch (error) {
    console.error('Error fetching nutritionist feedback:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get average rating for the logged-in nutritionist
router.get("/ratings", verifyToken, nutrenistOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ nutritionistId: req.user.id });
    const avgRating = feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0;
    res.json({
      averageRating: Number(avgRating.toFixed(1)),
      totalFeedbacks: feedbacks.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get list of nutritionists (public for clients to give feedback)
router.get("/nutritionists", async (req, res) => {
  try {
    const nutritionists = await User.find({ role: 'nutrenist' }, 'name email');
    res.json(nutritionists);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
