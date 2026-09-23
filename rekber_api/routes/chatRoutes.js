const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadChatImages } = require('../config/cloudinary');
const pool = require('../config/db');
const { decryptId } = require('../utils/idCipher');

// Admin dashboard URLs pakai id transaksi yang sudah di-encrypt (lihat
// dashboardController.js), sedangkan sisi user biasa masih pakai id polos —
// terima dua-duanya, sama seperti transactionChatController.js.
function resolveTransactionId(value) {
  if (!value) return value;
  if (/^\d+$/.test(String(value))) return String(value);
  return decryptId(value);
}

// POST - Upload image in chat
router.post('/upload-image', authMiddleware, uploadChatImages.single('image'), async (req, res) => {
  try {

    const userId = req.user.id;

    let transactionId;
    try {
      transactionId = resolveTransactionId(req.body.transaction_id);
    } catch (error) {
      return res.status(400).json({
        status: false,
        error: "ID transaksi tidak valid"
      });
    }

    if (!transactionId) {
      return res.status(400).json({
        status: false,
        error: "transaction_id is required"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: false,
        error: "No image uploaded"
      });
    }

    // Check user access to transaction (pembeli, penjual, atau admin)
    const accessCheck = await pool.query(`
      SELECT 1 FROM transactions t
      WHERE t.id = $1 AND (
        t.buyer_id = $2 OR t.seller_id = $2 OR t.created_by = $2
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = $2 AND u.is_admin::int != 0)
      )
    `, [transactionId, userId]);

    if (accessCheck.rowCount === 0) {
      return res.status(403).json({
        status: false,
        error: "Tidak memiliki akses ke chat transaksi ini"
      });
    }

    // Save to database
    const chatResult = await pool.query(`
      INSERT INTO transaction_chat (transaction_id, user_id, message, image_url, message_type)
      VALUES ($1, $2, $3, $4, 'image')
      RETURNING *
    `, [
      transactionId,
      userId,
      '',
      req.file.secure_url || req.file.path,
    ]);

    // Get user info
    const userInfo = await pool.query('SELECT name, is_admin FROM users WHERE id = $1', [userId]);
    const user = userInfo.rows[0];

    const chatData = {
      ...chatResult.rows[0],
      user_name: user.name,
      is_admin: user.is_admin
    };
 
    // EMIT SOCKET USING GLOBAL IO
    if (global.io) { 
      global.io.to(`transaction_${transactionId}`).emit("chat-message", chatData);
    } else {
      console.error('Global io not available');
    }

    return res.status(201).json({
      status: true,
      message: "Image uploaded and message sent",
      data: chatData
    });

  } catch (error) {
    console.error('Chat image upload error:', error);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
      debug: error.message
    });
  }
});

module.exports = router;