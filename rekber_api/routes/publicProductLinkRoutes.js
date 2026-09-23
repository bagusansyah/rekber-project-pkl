const express = require("express");
const router = express.Router();
const {
  getProductLinkSummaryController,
  redeemProductLinkController,
} = require("../controllers/publicProductLinkController");

// Deliberately unauthenticated: backs the public "Product Payment Link" page.
router.get("/:token", getProductLinkSummaryController);
router.post("/:token/redeem", redeemProductLinkController);

module.exports = router;
