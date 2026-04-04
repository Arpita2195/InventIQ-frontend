const Customer = require("../models/Customer");

const getCustomers = async (req, res) => {
  try {
    const list = await Customer.find({ user: req.user._id }).sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addCustomer = async (req, res) => {
  try {
    const c = await Customer.create({ ...req.body, user: req.user._id });
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateUdhar = async (req, res) => {
  try {
    const { amount, type, note } = req.body;
    const c = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!c) return res.status(404).json({ message: "Customer not found" });

    if (type === "borrow") c.udharBalance += Number(amount);
    else c.udharBalance -= Number(amount);

    c.history.push({ type, amount: Number(amount), date: new Date(), note });
    await c.save();
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteCustomer = async (req, res) => {
  try {
    await Customer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Customer deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCustomers, addCustomer, updateUdhar, deleteCustomer };
