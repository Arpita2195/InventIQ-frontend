const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const { createInternal } = require("./notification.controller");
const { classifyKiranaItem } = require("../services/classifierService");

const getAll = async (req, res) => {
  try {
    const items = await Inventory.find({ user: req.user._id }).sort({
      name: 1,
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      quantity,
      unit,
      price,
      lowStockThreshold,
      aliases,
    } = req.query.name ? { ...req.body, ...req.query } : req.body;
    const item = await Inventory.create({
      user: req.user._id,
      name,
      category,
      subcategory,
      quantity,
      unit,
      price,
      lowStockThreshold,
      aliases: aliases || [],
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    Object.assign(item, req.body);
    const updated = await item.save();
    
    // Check for Low Stock Trigger
    if (updated.quantity <= updated.lowStockThreshold) {
      await createInternal(req.user._id, `Low Stock: ${updated.name}`, `${updated.name} has only ${updated.quantity} remaining.`, "LOW_STOCK");
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    await Inventory.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({ user: req.user._id });
    const low = items.filter((i) => i.quantity <= i.lowStockThreshold);
    res.json(low);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStockFromChat = async (
  userId,
  itemName,
  change,
  type = "adjust",
) => {
  const items = await Inventory.find({ user: userId });
  const nameLower = itemName.toLowerCase();
  let item = items.find(
    (i) =>
      i.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(i.name.toLowerCase()) ||
      i.aliases.some((a) => a.toLowerCase().includes(nameLower)),
  );

  if (!item) {
    item = await Inventory.create({
      user: userId,
      name: itemName,
      quantity: Math.max(0, change),
      unit: "pcs",
    });
  } else {
    if (type === "set") {
      item.quantity = Math.max(0, change);
    } else {
      item.quantity = Math.max(0, item.quantity + change);
    }
    await item.save();
    
    // Check for Low Stock Trigger
    if (item.quantity <= item.lowStockThreshold) {
      await createInternal(userId, `Low Stock: ${item.name}`, `Chat updated: ${item.name} is now at ${item.quantity}.`, "LOW_STOCK");
    }

    if (change !== 0) {
      const isSale = change < 0;
      const amount = Math.abs(change);
      const priceToUse = isSale ? item.price : (item.purchasePrice || item.price * 0.85);
      
      await Sale.create({
        user: userId,
        item: item._id,
        itemName: item.name,
        quantity: amount,
        price: isSale ? item.price : priceToUse,
        costPrice: item.purchasePrice || (item.price * 0.85),
        total: amount * priceToUse,
        type: isSale ? "sale" : "purchase",
        note: `Chat update (${type})`,
      });
    }
  }
  return item;
};

const updatePriceFromChat = async (userId, itemName, newPrice) => {
  const items = await Inventory.find({ user: userId });
  const nameLower = itemName.toLowerCase();
  let item = items.find(
    (i) =>
      i.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(i.name.toLowerCase()) ||
      i.aliases.some((a) => a.toLowerCase().includes(nameLower)),
  );

  if (!item) {
    // Create new item if it doesn't exist
    item = await Inventory.create({
      user: userId,
      name: itemName,
      quantity: 0,
      unit: "pcs",
      price: Math.max(0, newPrice),
    });
  } else {
    // Update existing item's price
    item.price = Math.max(0, newPrice);
    await item.save();
  }
  return item;
};

const classifyItem = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const classification = await classifyKiranaItem(name);
    res.json(classification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPublicCatalog = async (req, res) => {
  try {
    const User = require("../models/User");
    const [shop, items] = await Promise.all([
      User.findById(req.params.userId).select("shopName"),
      Inventory.find({ user: req.params.userId }).select("name category price quantity").sort({ name: 1 })
    ]);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ shopName: shop.shopName, items });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getAll,
  addItem,
  updateItem,
  deleteItem,
  getLowStock,
  classifyItem,
  getPublicCatalog,
  updateStockFromChat,
  updatePriceFromChat,
};
