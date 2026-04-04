const { processMessage } = require("../services/claudeService");
const {
  updateStockFromChat,
  updatePriceFromChat,
} = require("./inventory.controller");
const Inventory = require("../models/Inventory");
const Bill = require("../models/Bill");
const ChatLog = require("../models/ChatLog");
const Sale = require("../models/Sale");

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const inventory = await Inventory.find({ user: user._id }).lean();
    const inventoryContext = inventory.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      price: i.price,
      purchasePrice: i.purchasePrice || 0,
      category: i.category,
    }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allSalesForStats = await Sale.find({ user: user._id, type: "sale" }).lean();
    
    const todaySalesForStats = allSalesForStats.filter(s => new Date(s.createdAt) >= today);
    const weeklySalesForStats = allSalesForStats.filter(s => new Date(s.createdAt) >= sevenDaysAgo);

    const todayRevenue = todaySalesForStats.reduce((a, s) => a + (s.total || 0), 0);
    const weeklyRevenue = weeklySalesForStats.reduce((a, s) => a + (s.total || 0), 0);
    const totalRevenue = allSalesForStats.reduce((a, s) => a + (s.total || 0), 0);

    const todayUnitsSold = todaySalesForStats.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const totalUnitsSold = allSalesForStats.reduce((sum, s) => sum + (s.quantity || 0), 0);
    
    const allBills = await Bill.find({ user: user._id }).lean();
    const todayBills = allBills.filter((b) => new Date(b.createdAt) >= today);
    const totalUdhar = allBills
      .filter((b) => b.creditType === "credit")
      .reduce((a, b) => a + (b.totalAmount || 0), 0);

    const todayProfit = todaySalesForStats.reduce((acc, sale) => {
      const cost = sale.costPrice || sale.price * 0.85;
      return acc + (sale.price - cost) * (sale.quantity || 1);
    }, 0);

    const salesContext = {
      todayRevenue,
      weeklyRevenue,
      todayProfit,
      todayUnitsSold,
      totalUdhar,
      todayBillsCount: todayBills.length,
      totalRevenue,
      totalUnitsSold,
    };

    console.log("Chat request:", { message, user: user._id });

    const aiResponse = await processMessage(
      message,
      inventoryContext,
      user.shopName || "My Store",
      user.language || "en",
      salesContext,
    );

    console.log("AI Response:", aiResponse);

    await ChatLog.create({ user: user._id, role: "user", content: message });

    let actionResult = null;
    try {
      if (
        aiResponse.action === "UPDATE_INVENTORY" &&
        aiResponse.data?.items?.length
      ) {
        const updates = [];
        for (const item of aiResponse.data.items) {
          const updated = await updateStockFromChat(
            user._id,
            item.name,
            item.change,
            item.type,
          );
          if (updated) {
            updates.push({ name: updated.name, quantity: updated.quantity });
          }
        }
        actionResult = { updated: updates };
      }

      if (
        aiResponse.action === "UPDATE_PRICE" &&
        aiResponse.data?.prices?.length
      ) {
        const updates = [];
        for (const priceUpdate of aiResponse.data.prices) {
          const updated = await updatePriceFromChat(
            user._id,
            priceUpdate.name,
            priceUpdate.price,
          );
          if (updated) {
            updates.push({ name: updated.name, price: updated.price });
          }
        }
        actionResult = { priceUpdates: updates };
      }

      if (aiResponse.action === "ADD_ITEM" && aiResponse.data?.newItem) {
        const ni = aiResponse.data.newItem;
        if (ni.name?.trim()) {
          const exists = await Inventory.findOne({
            user: user._id,
            name: new RegExp(ni.name, "i"),
          });
          if (!exists) {
            const newItem = await Inventory.create({ user: user._id, ...ni });
            actionResult = {
              added: {
                name: newItem.name,
                quantity: newItem.quantity,
                price: newItem.price,
              },
            };
          } else {
            actionResult = {
              added: { name: exists.name, message: "Item already exists" },
            };
          }
        }
      }

      if (
        aiResponse.action === "REMOVE_ITEM" &&
        aiResponse.data?.removeItems?.length
      ) {
        const removed = [];
        for (const itemName of aiResponse.data.removeItems) {
          const items = await Inventory.find({ user: user._id }).lean();
          const nameLower = itemName.toLowerCase();
          const item = items.find(
            (i) =>
              i.name.toLowerCase().includes(nameLower) ||
              nameLower.includes(i.name.toLowerCase()) ||
              i.aliases?.some((a) => a.toLowerCase().includes(nameLower)),
          );
          if (item) {
            await Inventory.findByIdAndDelete(item._id);
            removed.push(item.name);
          }
        }
        actionResult = { removed };
      }
    } catch (actionError) {
      console.error("Action execution error:", actionError);
    }

    if (aiResponse.action === "SALES_SUMMARY") {
      actionResult = {
        todayRevenue: salesContext.todayRevenue,
        weeklyRevenue: salesContext.weeklyRevenue,
        totalRevenue: salesContext.totalRevenue,
        todayProfit: salesContext.todayProfit,
        totalUdhar: salesContext.totalUdhar,
        todayBillsCount: salesContext.todayBillsCount,
      };
    }

    if (aiResponse.action === "TOTAL_REVENUE") {
      // Get all bills for total revenue calculation with item breakdown
      const allBills = await Bill.find({ user: user._id }).lean();
      const allSales = await Sale.find({ user: user._id, type: "sale" }).lean();

      // Calculate total revenue from bills (Subtotal)
      const totalRevenueFromBills = allBills.reduce(
        (sum, bill) => sum + (bill.subtotal || 0),
        0,
      );

      // Calculate total revenue from individual sales with breakdown
      const revenueByItem = {};
      let totalRevenueFromSales = 0;

      allSales.forEach((sale) => {
        if (!revenueByItem[sale.itemName]) {
          revenueByItem[sale.itemName] = {
            name: sale.itemName,
            quantity: 0,
            totalRevenue: 0,
            avgPrice: 0,
          };
        }
        revenueByItem[sale.itemName].quantity += sale.quantity || 1;
        revenueByItem[sale.itemName].totalRevenue +=
          sale.total || sale.price * (sale.quantity || 1);
        totalRevenueFromSales +=
          sale.total || sale.price * (sale.quantity || 1);
      });

      // Calculate average price per item
      Object.keys(revenueByItem).forEach((itemName) => {
        revenueByItem[itemName].avgPrice =
          revenueByItem[itemName].totalRevenue /
          revenueByItem[itemName].quantity;
      });

      // Sort items by revenue
      const topRevenueItems = Object.values(revenueByItem)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10); // Top 10 items

      actionResult = {
        totalRevenue: totalRevenueFromSales,
        totalRevenueFromBills,
        itemCount: Object.keys(revenueByItem).length,
        topRevenueItems,
        revenueByItem,
        totalBills: allBills.length,
        calculation: `Total Revenue = Σ(Item Price × Quantity Sold) across all sales`,
      };
    }

    await ChatLog.create({
      user: user._id,
      role: "assistant",
      content: aiResponse.reply,
      action: aiResponse.action,
      actionData: aiResponse.data,
    });

    res.json({
      reply: aiResponse.reply,
      action: aiResponse.action,
      data: aiResponse.data,
      actionResult,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "AI service error: " + err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const logs = await ChatLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const sales = await Sale.find({
      user: req.user._id,
      createdAt: { $gte: since },
    });

    const grouped = {};
    sales.forEach((s) => {
      const d = s.createdAt.toISOString().split("T")[0];
      if (!grouped[d])
        grouped[d] = { date: d, sales: 0, purchases: 0, revenue: 0 };
      if (s.type === "sale") {
        grouped[d].sales += s.quantity;
        grouped[d].revenue += s.total;
      }
      if (s.type === "purchase") grouped[d].purchases += s.quantity;
    });

    const topItems = {};
    sales
      .filter((s) => s.type === "sale")
      .forEach((s) => {
        if (!topItems[s.itemName])
          topItems[s.itemName] = { name: s.itemName, qty: 0, revenue: 0 };
        topItems[s.itemName].qty += s.quantity;
        topItems[s.itemName].revenue += s.total;
      });

    // Also calculate total all-time revenue for comparison
    const allSales = await Sale.find({ user: req.user._id, type: "sale" }).lean();
    const allTimeRevenue = allSales.reduce((a, s) => a + (s.total || 0), 0);

    res.json({
      daily: Object.values(grouped).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      topItems: Object.values(topItems)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),
      periodRevenue: sales
        .filter((s) => s.type === "sale")
        .reduce((a, s) => a + (s.total || 0), 0),
      totalRevenue: allTimeRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { chat, getHistory, getSalesReport };
