// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const {
  getDashboardStats,
  getTransactionsList,
  getUsersList,
  getUserDetail,
  updateUserPartnershipController,
  getDetailTransactionAdminController,
  disbursedTransactionController,
  refundTransactionController,
  cancelTransactionAdminController,
  completeTransactionAdminController,
  manualPaymentConfirmController
} = require('../controllers/dashboardController');
const {
  getAllKycAdminController,
  getKycDetailAdminController,
  approveKycController,
  rejectKycController,
} = require('../controllers/kycController');

// Apply admin auth middleware to all dashboard routes
router.use(adminAuthMiddleware);
 
router.get('/stats', getDashboardStats);
// Transactions management
router.get('/transactions', getTransactionsList);
router.get("/transactions/:id", getDetailTransactionAdminController); 

router.post("/transactions/:id/disbursed", disbursedTransactionController);
router.post("/transactions/:id/refund", refundTransactionController);
router.post("/transactions/:id/confirm-payment", manualPaymentConfirmController);
router.put("/transactions/:id/cancel", cancelTransactionAdminController);
router.put("/transactions/:id/complete", completeTransactionAdminController);

// Users management
router.get('/users', getUsersList);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/partnership', updateUserPartnershipController);

// KYC review
router.get('/kyc', getAllKycAdminController);
router.get('/kyc/:id', getKycDetailAdminController);
router.post('/kyc/:id/approve', approveKycController);
router.post('/kyc/:id/reject', rejectKycController);

module.exports = router;