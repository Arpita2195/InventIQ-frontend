const express = require("express");
const router = express.Router();
const { getSuppliers, addSupplier, updateSupplier, deleteSupplier } = require("../controllers/supplier.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getSuppliers);
router.post("/", addSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
