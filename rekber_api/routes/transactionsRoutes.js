const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTransactionController,
  getTransactionsController,
  getDetailTransactionController,
  updateTransactionToWaitingPaymentController,
  cancelTransactionController,
  completeTransactionController,
  createVAController,
  applyVoucherToTransactionController,
  getAllTransactionsAdmin
} = require("../controllers/transactionsController");

const { getTransactionChat, postTransactionChat } = require("../controllers/transactionChatController");
const { uploadTransactionShippingController, getTransactionShippingProofsController } = require('../controllers/transactionShippingController');
const { uploadTransactionShippingCloudinary, uploadProductImage } = require('../config/cloudinary');
const transactionsController = require('../controllers/transactionsController');

router.get('/:transactionId/shipping-proofs', authMiddleware, getTransactionShippingProofsController);
router.post(
  '/:id/upload-shipping-proof',
  authMiddleware,
  uploadTransactionShippingCloudinary.array('image', 5),
  uploadTransactionShippingController
);
 
// Create transaction
router.post("/", authMiddleware, uploadProductImage.array('product_images', 10), createTransactionController);

// Get list transaction by created_by (user id dari token)
router.get("/", authMiddleware, getTransactionsController);
router.get("/admin/all", authMiddleware, getAllTransactionsAdmin);
router.get("/:id", authMiddleware, getDetailTransactionController);
router.put("/:id/cancel", authMiddleware, cancelTransactionController);
router.put("/:id/complete", authMiddleware, completeTransactionController);

router.post('/apply-voucher', authMiddleware, applyVoucherToTransactionController);

router.put("/waiting-payment", authMiddleware, updateTransactionToWaitingPaymentController);

router.get("/:id/chat", authMiddleware, getTransactionChat);
router.post("/:id/chat", authMiddleware, postTransactionChat);

router.post("/create_VA", authMiddleware, createVAController);

// TAMBAHKAN INI (Pastikan ditaruh SEBELUM route /:id)
router.get('/unpaid', transactionsController.getUnpaidTransactions);

module.exports = router;