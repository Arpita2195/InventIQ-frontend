const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    subcategory: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "pcs" },
    price: { type: Number, default: 0 },
    purchasePrice: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    expiryDate: { type: Date },
    batchNumber: { type: String },
    mrp: { type: Number, default: 0 },
    aliases: [{ type: String }],
  },
  { timestamps: true },
);

inventorySchema.virtual("isLowStock").get(function () {
  return this.quantity <= this.lowStockThreshold;
});

module.exports = mongoose.model("Inventory", inventorySchema);
