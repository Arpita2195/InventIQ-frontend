const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  user: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  categories: [{ type: String }], // Categories they supply (e.g. "Milk", "Drinks")
  address: { type: String },
  email: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Supplier", supplierSchema);
