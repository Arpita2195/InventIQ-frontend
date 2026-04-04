const Bill = require("../models/Bill");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const { createInternal } = require("./notification.controller");

// Generate unique bill number: INV-YYYYMMDD-XXXX
const generateBillNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  // Use a random 4-digit number to avoid duplicate key errors across users
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
};

// GET all bills
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single bill
const getBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE bill + deduct inventory + log sales
const createBill = async (req, res) => {
  try {
    const { customer, phoneNumber, items, paymentMethod, creditType, notes } =
      req.body;

    if (!customer || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Customer name and at least one item are required" });
    }

    const billNumber = await generateBillNumber(req.user._id);

    // Calculate totals
    const processedItems = items.map((item) => {
      const total = item.quantity * item.price;
      const gstAmount = (total * (item.gstRate || 0)) / 100;
      return { ...item, total, gstAmount };
    });

    const subtotal = processedItems.reduce((a, i) => a + i.total, 0);
    const totalGST = processedItems.reduce((a, i) => a + i.gstAmount, 0);
    const totalAmount = subtotal + totalGST;

    // Create bill
    const bill = await Bill.create({
      user: req.user._id,
      billNumber,
      customer,
      phoneNumber,
      items: processedItems,
      subtotal,
      totalGST,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      creditType: creditType || "paid",
      notes,
    });

    // Deduct inventory for each item
    for (const item of processedItems) {
      if (item.inventoryId) {
        const invItem = await Inventory.findOne({
          _id: item.inventoryId,
          user: req.user._id,
        });
        if (invItem) {
          invItem.quantity = Math.max(0, invItem.quantity - item.quantity);
          await invItem.save();

          // Log sale
          await Sale.create({
            user: req.user._id,
            item: invItem._id,
            itemName: invItem.name,
            quantity: item.quantity,
            price: item.price,
            costPrice: invItem.purchasePrice || item.price * 0.85,
            total: item.total,
            type: "sale",
            note: `Bill #${billNumber}`,
          });
        }
      }
    }

    // Trigger Notification
    await createInternal(
      req.user._id,
      "Bill Generated",
      `Invoice #${billNumber} of ₹${totalAmount.toLocaleString()} generated.`,
      "BILL_SENT",
    );

    // Calculate total units sold today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = await Sale.find({
      user: req.user._id,
      type: "sale",
      createdAt: { $gte: today },
    });
    const totalUnitsSoldToday = todaySales.reduce(
      (sum, s) => sum + (s.quantity || 0),
      0,
    );

    // Trigger Units Sold Today Notification
    await createInternal(
      req.user._id,
      "📊 Units Sold Today",
      `You have sold ${totalUnitsSoldToday} units today.`,
      "UNITS_SOLD",
    );

    // 4. Update Khata (optional)
    if (creditType === "credit") {
      let cust = await Customer.findOne({
        user: req.user._id,
        phone: phoneNumber,
      });
      if (!cust) {
        cust = await Customer.create({
          user: req.user._id,
          name: customer,
          phone: phoneNumber || "0000000000",
        });
      }
      cust.udharBalance += totalAmount;
      cust.history.push({
        type: "borrow",
        amount: totalAmount,
        billId: bill._id,
        note: `Bill #${billNumber}`,
      });
      await cust.save();
    }

    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET bill stats
const getBillStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allBills = await Bill.find({ user: userId }).lean();
    const allSales = await Sale.find({ user: userId, type: "sale" }).lean();
    
    const todayBills = allBills.filter((b) => new Date(b.createdAt) >= today);
    const todaySales = allSales.filter((s) => new Date(s.createdAt) >= today);
    const weeklySales = allSales.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);

    const totalRevenue = allSales.reduce((a, s) => a + (s.total || 0), 0);
    const todayRevenue = todaySales.reduce((a, s) => a + (s.total || 0), 0);
    const weeklyRevenue = weeklySales.reduce((a, s) => a + (s.total || 0), 0);

    const dailyProfit = todaySales.reduce((acc, sale) => {
      const cost = sale.costPrice > 0 ? sale.costPrice : sale.price * 0.85;
      return acc + (sale.price - cost) * (sale.quantity || 1);
    }, 0);

    const totalGST = allBills.reduce((a, b) => a + b.totalGST, 0);
    const creditBills = allBills.filter((b) => b.creditType === "credit");
    const creditAmount = creditBills.reduce((a, b) => a + b.totalAmount, 0);

    res.json({
      totalBills: allBills.length,
      todayBills: todayBills.length,
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      dailyProfit,
      totalGST,
      creditAmount,
      creditCount: creditBills.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllBills, getBill, createBill, getBillStats };
