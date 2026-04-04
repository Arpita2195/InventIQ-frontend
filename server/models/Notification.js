const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["LOW_STOCK", "BILL_SENT", "CREDIT_LIMIT", "SALES_TARGET", "HIGH_VALUE", "REPORT_GEN", "SYSTEM", "RESTOCK_REQUEST"], default: "SYSTEM" },
  actionData: { type: Object, default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
