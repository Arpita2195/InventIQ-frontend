const express = require("express");
const router = express.Router();
const { getAll, addItem, updateItem, deleteItem, getLowStock, classifyItem, getPublicCatalog } = require("../controllers/inventory.controller");
const { protect } = require("../middleware/authMiddleware");

router.get("/public/:userId", getPublicCatalog);
router.use(protect);
router.get("/classify", classifyItem);
router.get("/", getAll);
router.get("/low-stock", getLowStock);
router.post("/", addItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
