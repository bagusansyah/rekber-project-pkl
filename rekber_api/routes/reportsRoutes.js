const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createReportController } = require('../controllers/reportsController');
const { uploadReports } = require('../config/cloudinary');

// POST - Create Report dengan Cloudinary upload
router.post('/', authMiddleware, uploadReports.array('evidence', 5), (req, res, next) => {
  console.log('After Cloudinary upload:');
  console.log('req.body:', req.body);
  console.log('req.files:', req.files);
  
  if (req.files) {
    req.files.forEach((file, index) => {
      console.log(`File ${index}:`, {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        public_id: file.public_id
      });
    });
  }
  
  next();
}, createReportController);

module.exports = router;