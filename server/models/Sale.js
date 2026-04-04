const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    item: { type: String },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["sale", "purchase", "adjustment"],
      default: "sale",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sale", saleSchema);
