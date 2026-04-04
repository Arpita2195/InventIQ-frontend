const express = require("express");
const router = express.Router();
const { getCustomers, addCustomer, updateUdhar, deleteCustomer } = require("../controllers/customer.controller");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/", getCustomers);
router.post("/", addCustomer);
router.put("/:id/udhar", updateUdhar);
router.delete("/:id", deleteCustomer);

module.exports = router;
