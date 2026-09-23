const express = require("express");
const router = express.Router();
const {
  getPublicTransactionSummary,
  claimPublicTransaction,
} = require("../controllers/publicTransactionController");

// Deliberately unauthenticated: this is what backs the public "Payment Link" page.
router.get("/:token", getPublicTransactionSummary);
router.post("/:token/claim", claimPublicTransaction);

module.exports = router;
