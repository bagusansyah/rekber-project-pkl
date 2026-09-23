// routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { adminLogin, getAdminProfile } = require('../controllers/adminAuthController');

// Admin login
router.post('/login', adminLogin);

// Admin profile (protected)
router.get('/profile', adminAuthMiddleware, getAdminProfile);

module.exports = router;