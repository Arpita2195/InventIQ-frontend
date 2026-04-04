const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    action: { type: String, default: "none" },
    actionData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ChatLog", chatLogSchema);
