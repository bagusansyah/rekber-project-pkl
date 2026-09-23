const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitKycController, getMyKycController } = require('../controllers/kycController');
const { uploadKyc } = require('../config/cloudinary');

router.post(
  '/',
  authMiddleware,
  uploadKyc.fields([
    { name: 'ktp_photo', maxCount: 1 },
    { name: 'selfie_with_ktp', maxCount: 1 },
    { name: 'selfie_video', maxCount: 1 },
  ]),
  submitKycController
);

router.get('/me', authMiddleware, getMyKycController);

module.exports = router;
