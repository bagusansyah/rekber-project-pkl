// controllers/transactionChatController.js
const pool = require("../config/db");
const { decryptId } = require("../utils/idCipher");

function resolveTransactionId(value) {
  if (!value) return value;

  if (/^\d+$/.test(String(value))) return String(value);

  return decryptId(value);
}

// Only the buyer, seller, or an admin may read/send a transaction's chat.
async function canAccessTransactionChat(transactionId, userId) {
  const result = await pool.query(
    `SELECT 1
     FROM transactions t
     WHERE t.id = $1
       AND (
         t.buyer_id = $2
         OR t.seller_id = $2
         OR t.created_by = $2
         OR EXISTS (SELECT 1 FROM users u WHERE u.id = $2 AND u.is_admin::int != 0)
       )`,
    [transactionId, userId]
  );
  return result.rowCount > 0;
}

async function getTransactionChat(req, res) {
  let transactionId;
  try {
    transactionId = resolveTransactionId(req.params.id || req.params.transaction_id);
  } catch (error) {
    return res.status(400).json({ error: "ID transaksi tidak valid" });
  }

  const allowed = await canAccessTransactionChat(transactionId, req.user.id);
  if (!allowed) {
    return res.status(403).json({ error: "Tidak memiliki akses ke chat transaksi ini" });
  }

  const result = await pool.query(
    `SELECT c.*, u.name AS user_name, u.is_admin AS is_admin
     FROM transaction_chat c
     JOIN users u ON c.user_id = u.id
     WHERE c.transaction_id = $1
     ORDER BY c.created_at ASC`,
    [transactionId]
  );
  res.json(result.rows);
}

async function postTransactionChat(req, res) {
  let transactionId;
  try {
    transactionId = resolveTransactionId(req.params.id || req.params.transaction_id);
  } catch (error) {
    return res.status(400).json({ error: "ID transaksi tidak valid" });
  }
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Pesan tidak boleh kosong" });
  }

  const allowed = await canAccessTransactionChat(transactionId, userId);
  if (!allowed) {
    return res.status(403).json({ error: "Tidak memiliki akses ke chat transaksi ini" });
  }

  const chatResult = await pool.query(
    `INSERT INTO transaction_chat (transaction_id, user_id, message, message_type)
     VALUES ($1, $2, $3, 'text')
     RETURNING *`,
    [transactionId, userId, message]
  );

  const userResult = await pool.query(
    "SELECT name, is_admin FROM users WHERE id = $1",
    [userId]
  );
  const chatData = {
    ...chatResult.rows[0],
    user_name: userResult.rows[0]?.name,
    is_admin: userResult.rows[0]?.is_admin,
  };

  if (global.io) {
    global.io.to(`transaction_${transactionId}`).emit("chat-message", chatData);
  }

  res.status(201).json({
    status: true,
    message: "Chat berhasil dikirim",
    data: chatData,
  });
}

module.exports = { getTransactionChat, postTransactionChat };