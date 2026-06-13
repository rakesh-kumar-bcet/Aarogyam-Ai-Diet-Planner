// routes/admin.js
const express = require("express");
const LoginLog = require("../models/LoginLog");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const DietHistory = require("../models/DietHistory");
const ContactRequest = require("../models/ContactRequest");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const {
  notifyNutritionist,
  sendToNutritionist,
  sendToUser,
} = require("../websocket");

const router = express.Router();

// GET ALL LOGIN LOGS - Admin only
router.get("/login-logs", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const logs = await LoginLog.find().populate('userId', 'name email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Error fetching login logs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER COUNTS - Admin only
router.get("/user-counts", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalNutrenists = await User.countDocuments({ role: 'nutrenist' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    res.json({ totalUsers, totalNutrenists, totalAdmins });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET NUTRITIONIST SUMMARY - Admin only
router.get("/nutritionists", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const nutritionists = await User.find({ role: 'nutrenist' }, 'name email createdAt');

    const summary = await Promise.all(
      nutritionists.map(async (nut) => {
        const feedbacks = await Feedback.find({ nutritionistId: nut._id }).populate('userId', 'name email').sort({ timestamp: -1 });
        const avgRating = feedbacks.length > 0 ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length : 0;
        const uniquePatients = [...new Map(feedbacks.map((f) => [f.userId._id.toString(), f.userId])).values()];

        return {
          id: nut._id,
          name: nut.name,
          email: nut.email,
          createdAt: nut.createdAt,
          averageRating: Number(avgRating.toFixed(1)),
          totalFeedbacks: feedbacks.length,
          patientCount: uniquePatients.length,
          recentFeedback: feedbacks.slice(0, 3).map((f) => ({
            id: f._id,
            clientName: f.userId?.name,
            clientEmail: f.userId?.email,
            rating: f.rating,
            comment: f.comment,
            timestamp: f.timestamp
          }))
        };
      })
    );

    res.json(summary);
  } catch (error) {
    console.error("Error fetching nutritionist summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PATIENT DIRECTORY - Admin only
router.get("/patients", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const patients = await User.find({ role: 'user' }, 'name email createdAt');
    const dietUserIds = await DietHistory.distinct('user');
    const patientDirectory = patients.map((patient) => ({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      joinedAt: patient.createdAt,
      hasDietPlan: dietUserIds.some((id) => id.toString() === patient._id.toString())
    }));
    res.json(patientDirectory);
  } catch (error) {
    console.error("Error fetching patient directory:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET NUTRITIONIST PROFILE - Admin only
router.get("/nutritionists/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const nutritionist = await User.findById(req.params.id, 'name email createdAt role');
    if (!nutritionist || nutritionist.role !== 'nutrenist') {
      return res.status(404).json({ message: 'Nutritionist not found' });
    }

    const feedbacks = await Feedback.find({ nutritionistId: nutritionist._id })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    const contacts = await ContactRequest.find({ nutritionistId: nutritionist._id })
      .populate('userId', 'name email');

    const patientMap = new Map();
    contacts.forEach((contact) => {
      if (contact.userId) {
        const id = contact.userId._id.toString();
        patientMap.set(id, {
          id: contact.userId._id,
          name: contact.userId.name,
          email: contact.userId.email,
          contactStatus: contact.status,
          requestedAt: contact.timestamp,
          feedbackCount: 0
        });
      }
    });

    feedbacks.forEach((feedback) => {
      if (feedback.userId) {
        const id = feedback.userId._id.toString();
        if (patientMap.has(id)) {
          patientMap.get(id).feedbackCount += 1;
        } else {
          patientMap.set(id, {
            id: feedback.userId._id,
            name: feedback.userId.name,
            email: feedback.userId.email,
            contactStatus: 'feedback',
            requestedAt: null,
            feedbackCount: 1
          });
        }
      }
    });

    const patients = await Promise.all(
      Array.from(patientMap.values()).map(async (patient) => {
        const plans = await DietHistory.find({ user: patient.id })
          .sort({ createdAt: -1 })
          .limit(3);

        return {
          ...patient,
          planCount: plans.length,
          latestPlanAt: plans[0]?.createdAt || null,
          recentPlans: plans.map((entry) => ({
            id: entry._id,
            createdAt: entry.createdAt,
            dailyCalories: entry.plan.dailyCalories,
            notes: entry.plan.notes || [],
            avoid: entry.plan.avoid || [],
            prefer: entry.plan.prefer || [],
            weekly: entry.plan.weekly || []
          }))
        };
      })
    );

    const averageRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length
      : 0;

    res.json({
      nutritionist: {
        id: nutritionist._id,
        name: nutritionist.name,
        email: nutritionist.email,
        joinedAt: nutritionist.createdAt,
        averageRating: Number(averageRating.toFixed(1)),
        totalFeedbacks: feedbacks.length,
        totalContacts: contacts.length,
        totalPatients: patients.length
      },
      feedbacks: feedbacks.slice(0, 5).map((feedback) => ({
        id: feedback._id,
        clientName: feedback.userId?.name,
        clientEmail: feedback.userId?.email,
        rating: feedback.rating,
        comment: feedback.comment,
        timestamp: feedback.timestamp
      })),
      patients
    });
  } catch (error) {
    console.error("Error fetching nutritionist profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL NUTRITIONIST FEEDBACK - Admin only
router.get("/feedback", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .populate('nutritionistId', 'name email')
      .sort({ timestamp: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching admin feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL AVAILABLE NUTRITIONISTS (for users to contact)
router.get("/nutritionists-available", async (req, res) => {
  try {
    const nutritionists = await User.find(
      { role: 'nutrenist', isProfileComplete: true }, 
      'name degree specialization phone contactPreference createdAt'
    ).lean();

    // Get ratings for each nutritionist
    const NutritionistRating = require("../models/NutritionistRating");
    const nutritionistsWithRatings = await Promise.all(
      nutritionists.map(async (nut) => {
        const ratings = await NutritionistRating.find({ nutritionistId: nut._id });
        const averageRating = ratings.length > 0 
          ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) 
          : 0;
        
        return {
          id: nut._id,
          name: nut.name,
          degree: nut.degree,
          specialization: nut.specialization,
          phone: nut.phone,
          contactPreference: nut.contactPreference,
          averageRating: Number(averageRating),
          totalRatings: ratings.length,
          joinedAt: nut.createdAt
        };
      })
    );

    res.json(nutritionistsWithRatings);
  } catch (error) {
    console.error("Error fetching available nutritionists:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// SUBMIT NUTRITIONIST RATING
router.post("/submit-nutritionist-rating", verifyToken, async (req, res) => {
  try {
    const { nutritionistId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!nutritionistId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating data" });
    }

    const NutritionistRating = require("../models/NutritionistRating");
    
    // Check if rating already exists
    let existingRating = await NutritionistRating.findOne({ userId, nutritionistId });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment || '';
      existingRating.timestamp = new Date();
      await existingRating.save();
      return res.json({ message: "Rating updated successfully", rating: existingRating });
    }

    const newRating = await NutritionistRating.create({
      userId,
      nutritionistId,
      rating,
      comment: comment || ''
    });

    res.json({ message: "Rating submitted successfully", rating: newRating });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CONTACT A NUTRITIONIST
router.post("/contact-nutritionist", verifyToken, async (req, res) => {
  try {
    const { nutritionistId, message, contactMethod } = req.body;
    const userId = req.user.id;

    if (!nutritionistId || !message) {
      return res.status(400).json({ message: "Nutritionist and message are required" });
    }

    const nutritionist = await User.findById(nutritionistId);
    if (!nutritionist || nutritionist.role !== 'nutrenist') {
      return res.status(404).json({ message: "Nutritionist not found" });
    }

    const user = await User.findById(userId);
    const contactRequest = await ContactRequest.create({
      userId,
      nutritionistId,
      message,
      contactMethod,
      status: 'pending',
      messages: [
        {
          sender: 'user',
          senderName: user?.name || 'User',
          text: message,
          timestamp: new Date(),
        },
      ],
    });

    const notificationPayload = {
      eventType: contactMethod === 'call' ? 'call_request' : 'new_contact_request',
      requestId: contactRequest._id,
      userId,
      nutritionistId,
      contactMethod,
      message,
      senderName: user?.name || 'User',
      timestamp: contactRequest.timestamp,
    };

    notifyNutritionist(nutritionistId, notificationPayload);

    const responseMessage = contactMethod === 'message' ? 'Message sent' : 'Call request sent successfully';
    res.json({ message: responseMessage, request: contactRequest });
  } catch (error) {
    console.error("Error sending contact request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/contact-history", verifyToken, async (req, res) => {
  try {
    const requests = await ContactRequest.find({ userId: req.user.id })
      .populate('nutritionistId', 'name degree specialization phone')
      .sort({ timestamp: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching contact history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/resolve-contact-request", verifyToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest || contactRequest.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    contactRequest.resolved = true;
    contactRequest.status = 'resolved';
    await contactRequest.save();

    res.json({ message: "Contact request marked as resolved", request: contactRequest });
  } catch (error) {
    console.error("Error resolving contact request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/send-contact-message", verifyToken, async (req, res) => {
  try {
    const { requestId, message } = req.body;
    const userId = req.user.id;

    if (!requestId || !message) {
      return res.status(400).json({ message: "Request ID and message are required" });
    }

    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest || contactRequest.userId.toString() !== userId) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    const user = await User.findById(userId);
    contactRequest.messages.push({
      sender: 'user',
      senderName: user.name,
      text: message,
      timestamp: new Date(),
    });
    contactRequest.status = contactRequest.resolved ? 'resolved' : 'answered';

    await contactRequest.save();

    sendToNutritionist(contactRequest.nutritionistId.toString(), 'chat_message', {
      requestId: contactRequest._id,
      sender: 'user',
      senderName: user.name,
      text: message,
      timestamp: new Date(),
    });

    res.json({ message: "Message sent successfully", request: contactRequest });
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;