const mongoose = require("mongoose");

const billSchema = mongoose.Schema(
  {
    user: { type: String, required: true },
    billNumber: { type: String, unique: true, required: true },
    customer: { type: String, required: true },
    phoneNumber: { type: String },
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
        gstRate: Number,
        total: Number,
        gstAmount: Number,
      },
    ],
    subtotal: { type: Number, default: 0 },
    totalGST: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit", "card", "upi"],
      default: "cash",
    },
    creditType: { type: String, enum: ["paid", "credit"], default: "paid" },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Bill", billSchema);
