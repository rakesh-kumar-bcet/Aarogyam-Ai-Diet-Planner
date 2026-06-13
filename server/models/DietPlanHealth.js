const mongoose = require('mongoose');

const dietPlanHealthSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  age: { type: Number, required: true },
  weight: { type: Number, required: true }, // in kg
  height: { type: Number, required: true }, // in cm
  bmi: { type: Number, default: 0 },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
    default: 'moderate'
  },
  dietaryRestrictions: [String], // e.g., ['vegetarian', 'gluten-free', etc.]
  healthConditions: [String], // e.g., ['diabetes', 'hypertension', 'obesity', etc.]
  medications: [String],
  allergies: [String],
  healthRiskLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  requiresNutritionistConsultation: { 
    type: Boolean, 
    default: false 
  },
  consultationReason: { 
    type: String, 
    default: null 
  },
  dietPlanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DietHistory'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('DietPlanHealth', dietPlanHealthSchema);
