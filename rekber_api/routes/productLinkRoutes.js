const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadProductImage } = require("../config/cloudinary");
const {
  createProductLinkController,
  listProductLinksController,
  listProductLinkTransactionsController,
  toggleProductLinkController,
} = require("../controllers/productLinkController");

router.post("/", authMiddleware, uploadProductImage.array("product_images", 10), createProductLinkController);
router.get("/", authMiddleware, listProductLinksController);
router.get("/:id/transactions", authMiddleware, listProductLinkTransactionsController);
router.put("/:id/active", authMiddleware, toggleProductLinkController);

module.exports = router;
