const Notification = require("../models/Notification");
const Inventory = require("../models/Inventory");
const Bill = require("../models/Bill");
const Supplier = require("../models/Supplier");
const { getSupplierForCategory } = require("./supplier.controller");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Stock Checks (Scan for existing low stock)
    const items = await Inventory.find({ user: userId });
    const allSuppliers = await Supplier.find({ user: userId });

    for (const item of items) {
      if (item.quantity <= item.lowStockThreshold) {
        // Find Supplier for this Category
        let supplier = await getSupplierForCategory(userId, item.category);

        // ULTIMATE FALLBACK: If no category match, just pick the first supplier (if any exist)
        if (!supplier && allSuppliers.length > 0) {
          supplier = allSuppliers[0];
        }

        let actionData = null;
        if (supplier) {
          const msg = `Hi ${supplier.name}, I'm the owner of InventIQ Kirana. I need to order ${item.name} (${item.unit || "pcs"}). Please let me know the availability.`;
          actionData = {
            waUrl: `https://wa.me/${supplier.phone}?text=${encodeURIComponent(msg)}`,
            supplierName: supplier.name,
          };
        }

        const existing = await Notification.findOne({
          user: userId,
          title: `Low Stock: ${item.name}`,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!existing) {
          await Notification.create({
            user: userId,
            title: `Low Stock: ${item.name}`,
            message: `${item.name} has only ${item.quantity} remaining.`,
            type: "LOW_STOCK",
            actionData,
          });
        } else if (!existing.actionData && actionData) {
          existing.actionData = actionData;
          await existing.save();
        }
      }
    }

    // 2. Sales Targets & Credit (Udhar) Checks
    const allBills = await Bill.find({ user: userId });
    const todayBills = allBills.filter((b) => new Date(b.createdAt) >= today);
    const todayRevenue = todayBills.reduce((a, b) => a + b.totalAmount, 0);

    // Performance Check: Daily ₹5000 Target
    if (todayRevenue >= 5000) {
      const targetNote = await Notification.findOne({
        user: userId,
        title: "🏆 Daily Sales Target Met!",
        createdAt: { $gte: today },
      });
      if (!targetNote)
        await Notification.create({
          user: userId,
          title: "🏆 Daily Sales Target Met!",
          message: `Excellent! You crossed ₹5,000 in sales today (Actual: ₹${todayRevenue.toLocaleString()}).`,
          type: "SALES_TARGET",
        });
    }

    // Money check: High Value Item Alert (Sale over ₹1000)
    for (const bill of todayBills) {
      if (bill.totalAmount >= 1000) {
        const hvNote = await Notification.findOne({
          user: userId,
          title: "💰 High Value Sale!",
          message: new RegExp(bill.billNumber),
        });
        if (!hvNote)
          await Notification.create({
            user: userId,
            title: "💰 High Value Sale!",
            message: `Invoice #${bill.billNumber} for ₹${bill.totalAmount.toLocaleString()} generated. Great job!`,
            type: "HIGH_VALUE",
          });
      }
    }

    // Debt check: Total Udhar (Credit) Check (Over ₹2000 total)
    const totalUdhar = allBills
      .filter((b) => b.creditType === "credit")
      .reduce((a, b) => a + b.totalAmount, 0);
    if (totalUdhar >= 2000) {
      const udharNote = await Notification.findOne({
        user: userId,
        title: "📍 High Credit (Udhar) Alert",
        createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      });
      if (!udharNote)
        await Notification.create({
          user: userId,
          title: "📍 High Credit (Udhar) Alert",
          message: `Total Udhar amount has reached ₹${totalUdhar.toLocaleString()}. Consider collections soon!`,
          type: "CREDIT_LIMIT",
        });
    }

    const list = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const id = req.params.id;
    await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id.toString() },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createInternal = async (userId, title, message, type) => {
  try {
    if (!userId) return;
    await Notification.create({
      user: userId.toString(),
      title,
      message,
      type,
    });
  } catch (err) {
    console.error("Internal Notification Error:", err);
  }
};

module.exports = { getNotifications, markRead, createInternal };
