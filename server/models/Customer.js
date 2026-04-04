const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  udharBalance: { type: Number, default: 0 },
  history: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["borrow", "repay"], required: true },
    amount: { type: Number, required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
    note: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
