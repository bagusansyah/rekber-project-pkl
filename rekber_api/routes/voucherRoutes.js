const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getVouchersController,
  getVoucherDetailController,
  createVoucherController,
  updateVoucherController,
  deleteVoucherController,
  applyVoucherController
} = require('../controllers/voucherController');

// Public routes
router.post('/apply', authMiddleware, applyVoucherController);

// Admin routes
router.get('/', authMiddleware, getVouchersController);
router.get('/:id', authMiddleware, getVoucherDetailController);
router.post('/', authMiddleware, createVoucherController);
router.put('/:id', authMiddleware, updateVoucherController);
router.delete('/:id', authMiddleware, deleteVoucherController);

module.exports = router;