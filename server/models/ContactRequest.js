const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'nutritionist'], required: true },
  senderName: { type: String, default: '' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const contactRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nutritionistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  contactMethod: { type: String, enum: ['message', 'call'], default: 'message' },
  status: { type: String, enum: ['pending', 'answered', 'resolved'], default: 'pending' },
  response: { type: String, default: '' },
  responseAt: { type: Date, default: null },
  resolved: { type: Boolean, default: false },
  messages: [messageSchema],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);