const express = require("express");
const router = express.Router();
const { getAllBills, getBill, createBill, getBillStats } = require("../controllers/bill.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getAllBills);
router.get("/stats", getBillStats);
router.get("/:id", getBill);
router.post("/", createBill);

module.exports = router;
