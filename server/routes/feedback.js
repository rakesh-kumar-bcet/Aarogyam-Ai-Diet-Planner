const express = require('express');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Submit feedback (for clients)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nutritionistId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!nutritionistId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    // Check if nutritionist exists and has role 'nutrenist'
    const nutritionist = await User.findById(nutritionistId);
    if (!nutritionist || nutritionist.role !== 'nutrenist') {
      return res.status(400).json({ message: 'Invalid nutritionist' });
    }

    const feedback = new Feedback({
      userId,
      nutritionistId,
      rating,
      comment: comment || ''
    });

    await feedback.save();
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feedback for a nutritionist (for admins or public?)
router.get('/:nutritionistId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ nutritionistId: req.params.nutritionistId })
      .populate('userId', 'name')
      .sort({ timestamp: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;