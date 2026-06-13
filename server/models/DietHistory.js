const mongoose = require("mongoose");

const dietHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  input: Object,
  plan: Object
}, { timestamps: true });

module.exports =
  mongoose.models.DietHistory ||
  mongoose.model("DietHistory", dietHistorySchema);
