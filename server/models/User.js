const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "nutrenist", "admin"],
      default: "user"
    },
    // Nutritionist-specific fields
    degree: { type: String, default: null }, // For nutritionists
    specialization: { type: String, default: null }, // For nutritionists
    phone: { type: String, default: null },
    weight: { type: Number, default: null }, // user's weight in kg
    contactPreference: { type: [String], enum: ['chat', 'message', 'call'], default: ['chat'] }, // For nutritionists
    isProfileComplete: { type: Boolean, default: false } // Track if nutritionist profile is complete
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
