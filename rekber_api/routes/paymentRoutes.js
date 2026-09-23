// routes/paymentRoutes.js
const express = require('express');
const { handlePaymentCallback, notifyPaymentStatus } = require('../controllers/paymentCallbackController');
const router = express.Router();

// Webhook endpoint untuk payment gateway
router.post('/callback', handlePaymentCallback);

// Manual notify endpoint (untuk testing/admin)
router.post('/notify', notifyPaymentStatus);

module.exports = router;