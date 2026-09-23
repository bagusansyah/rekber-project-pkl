const express = require('express');
const router = express.Router();
const { getPaymentChannelsController } = require("../controllers/paymentChannelController");

// Get all payment channels from external API
router.get("/", getPaymentChannelsController);

module.exports = router;