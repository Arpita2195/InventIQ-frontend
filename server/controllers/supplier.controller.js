const Supplier = require("../models/Supplier");

const getSuppliers = async (req, res) => {
  try {
    const list = await Supplier.find({ user: req.user._id }).sort({ name: 1 });
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addSupplier = async (req, res) => {
  try {
    const s = await Supplier.create({ ...req.body, user: req.user._id });
    res.status(201).json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSupplier = async (req, res) => {
  try {
    const s = await Supplier.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Supplier deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSupplierForCategory = async (userId, category) => {
  try {
    const suppliers = await Supplier.find({ user: userId });
    
    // 1. Try exact/case-insensitive category match
    const catLower = category?.toLowerCase();
    let match = suppliers.find(s => 
      s.categories.some(c => c.toLowerCase() === catLower)
    );

    // 2. Fallback to '*' or 'All' or any catch-all supplier
    if (!match) {
      match = suppliers.find(s => 
        s.categories.some(c => c === '*' || c.toLowerCase() === 'all' || c.toLowerCase() === 'general')
      );
    }

    return match || null;
  } catch (err) { return null; }
}

module.exports = { getSuppliers, addSupplier, updateSupplier, deleteSupplier, getSupplierForCategory };
