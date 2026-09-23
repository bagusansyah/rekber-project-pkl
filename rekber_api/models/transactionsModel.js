const pool = require("../config/db");
const crypto = require("crypto");

// Helper untuk generate kode transaksi unik
function generateTransactionCode(createdBy) {
  const uniq = Date.now().toString().slice(-6); // 6 digit terakhir timestamp
  return `TRS-${createdBy}${uniq}`;
}
async function createTransaction(data) {
  const {
    title,
    buyer_id,
    seller_id,
    status,
    total_amount,
    fee_amount,
    amount_paid,
    is_funded,
    funded_at,
    notes,
    created_by,
    roles,
    fee_by,
    categ_id,
    shipping_option,
    shipping_fee,
    work_duration,
    voucher_id,          // Tambahan untuk voucher
    voucher_discount,     // Tambahan untuk voucher
    is_partnership,
    partnership_percentage,
    fee_partnership
  } = data;

  const kode_transaksi = generateTransactionCode(created_by);

  const result = await pool.query(
    `INSERT INTO transactions 
      (kode_transaksi, title, buyer_id, seller_id, status, total_amount, fee_amount, amount_paid, is_funded, funded_at, notes, created_at, updated_at, created_by, roles, fee_by, categ_id, shipping_option, shipping_fee, work_duration, voucher_id, voucher_discount, is_partnership, partnership_percentage, fee_partnership)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
     RETURNING *`,
    [
      kode_transaksi,
      title,
      buyer_id,
      seller_id,
      status,
      total_amount,
      fee_amount,
      amount_paid,
      is_funded,
      funded_at,
      notes,
      created_by,
      roles,
      fee_by, 
      categ_id,
      shipping_option,
      shipping_fee,
      work_duration,
      voucher_id || null,         // Tambahan parameter voucher_id
      voucher_discount || 0,       // Tambahan parameter voucher_discount
      is_partnership || false,
      partnership_percentage || 0,
      fee_partnership || 0
    ]
  );
  return result.rows[0];
}

// Ambil semua transaksi berdasarkan user id (buyer/seller)
async function getTransactionsByUserId(userId) {
  const result = await pool.query(
    `
    SELECT 
      t.*,
      buyer.name  AS buyer_name,
      seller.name AS seller_name,
      seller.email AS seller_email
    FROM transactions t
    LEFT JOIN users buyer ON t.buyer_id = buyer.id
    LEFT JOIN users seller ON t.seller_id = seller.id
    WHERE t.buyer_id = $1 OR t.seller_id = $1
    ORDER BY t.created_at DESC
    `,
    [userId]
  );
  return result.rows;
}
async function getTransactionsByUserIdAll(userId) {
  const result = await pool.query(
    `
    SELECT 
      t.*,
      buyer.name  AS buyer_name,
      seller.name AS seller_name,
      seller.email AS seller_email,
      t.is_partnership AS is_partnership,
      t.partnership_percentage AS partnership_percentage,
      
      -- INJEKSI NAMA LAWAN BICARA UNTUK AVATAR FRONTEND
      CASE 
        WHEN t.buyer_id = $1 THEN seller.name 
        ELSE buyer.name 
      END AS other_party_name,
      
      -- INJEKSI SUBQUERY UNTUK INBOX CHAT FRONTEND
      (
        SELECT message 
        FROM transaction_chat tc 
        WHERE tc.transaction_id = t.id 
        ORDER BY tc.created_at DESC 
        LIMIT 1
      ) AS last_message,
      
      (
        SELECT created_at 
        FROM transaction_chat tc 
        WHERE tc.transaction_id = t.id 
        ORDER BY tc.created_at DESC 
        LIMIT 1
      ) AS last_message_time,
      
      -- BYPASS KARENA KOLOM is_read BELUM ADA
      0 AS unread_count

    FROM transactions t
    LEFT JOIN users buyer ON t.buyer_id = buyer.id
    LEFT JOIN users seller ON t.seller_id = seller.id
    WHERE 
      OR t.created_by = $1
      OR t.buyer_id = $1
      OR t.seller_id = $1
    ORDER BY 
      COALESCE(
        (SELECT created_at FROM transaction_chat tc WHERE tc.transaction_id = t.id ORDER BY tc.created_at DESC LIMIT 1), 
        t.created_at
      ) DESC
    `,
    [userId]
  );
  return result.rows;
}
async function createTransactionStatusLog({ transaction_id, status, name, update_by, note }) {
  const query = `
    INSERT INTO transaction_status_logs (transaction_id, status, note, name, update_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [transaction_id, status,note, name, update_by || null];
  const result = await pool.query(query, values);
  return result.rows[0];
}
async function getTransactionById(id, userId) {
  const result = await pool.query(
    `SELECT t.*,
            buyer.name AS buyer_name,
            buyer.email AS buyer_email,
            buyer.phone AS buyer_phone,
            buyer.is_verified AS buyer_is_verified,
            seller.name AS seller_name,
            seller.email AS seller_email,
            seller.phone AS seller_phone,
            seller.is_verified AS seller_is_verified,
            t.is_partnership AS is_partnership,
            t.partnership_percentage AS partnership_percentage
     FROM transactions t
     LEFT JOIN users buyer ON t.buyer_id = buyer.id
     LEFT JOIN users seller ON t.seller_id = seller.id
     WHERE t.id = $1
       AND (
         t.buyer_id = $2
         OR t.seller_id = $2
       )`,
    [id, userId]
  );
  return result.rows[0];
}

// Ambil logs status transaksi jika user terkait
async function getTransactionStatusLogsById(transactionId, userId) {
  // // Cek dulu apakah user punya akses ke transaksi ini
  // const trx = await getTransactionById(transactionId, userId);
  // if (!trx) {
  //   // User tidak berhak akses transaksi ini
  //   return null;
  // }

  const result = await pool.query(
    `SELECT * 
     FROM transaction_status_logs 
     WHERE transaction_id = $1
     ORDER BY created_at ASC`,
    [transactionId]
  );
  return result.rows;
}

async function findTransactionByRefId(refId) {
  const query = "SELECT * FROM transactions WHERE kode_transaksi = $1";
  return await pool.query(query, [refId]);
}

async function findTransactionById(id) {
  const query = "SELECT * FROM transactions WHERE id = $1";
  return await pool.query(query, [id]);
}

async function updateTransactionStatus(id, status) {
  const query = `
    UPDATE transactions 
    SET status = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING *
  `;
  return await pool.query(query, [status, id]);
}
module.exports = {
  createTransaction,
  getTransactionsByUserId,
  getTransactionById,
  createTransactionStatusLog,
  getTransactionStatusLogsById,
  findTransactionById,
  updateTransactionStatus,
  findTransactionByRefId,
  getTransactionsByUserIdAll,
  getTransactionByPublicToken,
  attachParticipantsAndActivate
};

// Helper untuk generate kode transaksi unik
function generateTransactionCode(createdBy) {
  const uniq = Date.now().toString().slice(-6); // 6 digit terakhir timestamp
  return `TRS-${createdBy}${uniq}`;
}

// Token acak (bukan kode_transaksi, yang bisa ditebak) untuk link publik/Payment Link
function generatePublicToken() {
  return crypto.randomBytes(24).toString("base64url");
}

async function createTransaction(data) {
  const {
    title,
    buyer_id,
    seller_id,
    status,
    total_amount,
    fee_amount,
    amount_paid,
    is_funded,
    funded_at,
    notes,
    created_by,
    roles,
    fee_by,
    categ_id,
    shipping_option,
    shipping_fee,
    work_duration,
    voucher_id,          // Tambahan untuk voucher
    voucher_discount,     // Tambahan untuk voucher
    expired_at,
    is_partnership,
    partnership_percentage,
    fee_partnership,
    product_images,
    product_link_id      // Diisi jika transaksi ini dibuat dari klik Product Payment Link
  } = data;

  const kode_transaksi = generateTransactionCode(created_by);
  const public_token = generatePublicToken();

  const result = await pool.query(
    `INSERT INTO transactions
      (kode_transaksi, title, buyer_id, seller_id, status, total_amount, fee_amount, amount_paid, is_funded, funded_at, notes, created_at, updated_at, created_by, roles, fee_by, categ_id, shipping_option, shipping_fee, work_duration, voucher_id, voucher_discount, expired_at, is_partnership, partnership_percentage, fee_partnership, product_images, public_token, product_link_id)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
     RETURNING *`,
    [
      kode_transaksi,
      title,
      buyer_id,
      seller_id,
      status,
      total_amount,
      fee_amount,
      amount_paid,
      is_funded,
      funded_at,
      notes,
      created_by,
      roles,
      fee_by,
      categ_id,
      shipping_option,
      shipping_fee,
      work_duration,
      voucher_id || null,         // Tambahan parameter voucher_id
      voucher_discount || 0,       // Tambahan parameter voucher_discount
      expired_at || null,
      is_partnership || false,
      partnership_percentage || 0,
      fee_partnership || 0,
      product_images && product_images.length ? product_images : null,
      public_token,
      product_link_id || null
    ]
  );
  return result.rows[0];
}

// Ambil transaksi berdasarkan public_token (untuk halaman Payment Link publik, tanpa login)
async function getTransactionByPublicToken(token) {
  const result = await pool.query(
    `SELECT t.*,
            seller.name AS seller_name,
            seller.email AS seller_email,
            seller.is_verified AS seller_is_verified
     FROM transactions t
     LEFT JOIN users seller ON t.seller_id = seller.id
     WHERE t.public_token = $1`,
    [token]
  );
  return result.rows[0];
}

// Tempel buyer/seller ke transaksi draft dan pindahkan ke wait_payment.
// Dipakai baik oleh flow "tambahkan lawan transaksi by email" (updateTransactionToWaitingPaymentController)
// maupun flow "klaim Payment Link publik" (claimPublicTransaction, yang hanya pernah mengisi slot buyer).
async function attachParticipantsAndActivate(transaction, buyerId, sellerId, actorId) {
  await pool.query(
    `UPDATE transactions SET buyer_id = $1, seller_id = $2, status = 'wait_payment' WHERE id = $3`,
    [buyerId, sellerId, transaction.id]
  );

  await createTransactionStatusLog({
    transaction_id: transaction.id,
    status: "wait_payment",
    name: "Menunggu pembayaran",
    update_by: actorId,
    note: `Transaksi ${transaction.kode_transaksi} diupdate ke waiting payment`,
  });

  return { buyer_id: buyerId, seller_id: sellerId };
}

// Ambil semua transaksi berdasarkan user id (buyer/seller)
async function getTransactionsByUserId(userId) {
  const result = await pool.query(
    `
    SELECT 
      t.*,
      buyer.name  AS buyer_name,
      seller.name AS seller_name,
      seller.email AS seller_email
    FROM transactions t
    LEFT JOIN users buyer ON t.buyer_id = buyer.id
    LEFT JOIN users seller ON t.seller_id = seller.id
    WHERE t.buyer_id = $1 OR t.seller_id = $1
    ORDER BY t.created_at DESC
    `,
    [userId]
  );
  return result.rows;
}
async function getTransactionsByUserIdAll(userId) {
  const result = await pool.query(
    `
    SELECT 
      t.*,
      buyer.name  AS buyer_name,
      seller.name AS seller_name,
      seller.email AS seller_email,
      t.is_partnership AS is_partnership,
      t.partnership_percentage AS partnership_percentage,
      
      -- INJEKSI NAMA LAWAN BICARA UNTUK AVATAR FRONTEND
      CASE 
        WHEN t.buyer_id = $1 THEN seller.name 
        ELSE buyer.name 
      END AS other_party_name,
      
      -- INJEKSI SUBQUERY UNTUK INBOX CHAT FRONTEND
      (
        SELECT message 
        FROM transaction_chat tc 
        WHERE tc.transaction_id = t.id 
        ORDER BY tc.created_at DESC 
        LIMIT 1
      ) AS last_message,
      
      (
        SELECT created_at 
        FROM transaction_chat tc 
        WHERE tc.transaction_id = t.id 
        ORDER BY tc.created_at DESC 
        LIMIT 1
      ) AS last_message_time,
      
      -- BYPASS KARENA KOLOM is_read BELUM ADA
      0 AS unread_count

    FROM transactions t
    LEFT JOIN users buyer ON t.buyer_id = buyer.id
    LEFT JOIN users seller ON t.seller_id = seller.id
    WHERE t.created_by = $1
      OR t.buyer_id = $1
      OR t.seller_id = $1
    ORDER BY 
      COALESCE(
        (SELECT created_at FROM transaction_chat tc WHERE tc.transaction_id = t.id ORDER BY tc.created_at DESC LIMIT 1), 
        t.created_at
      ) DESC
    `,
    [userId]
  );
  return result.rows;
}
async function createTransactionStatusLog({ transaction_id, status, name, update_by, note }) {
  const query = `
    INSERT INTO transaction_status_logs (transaction_id, status, note, name, update_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [transaction_id, status,note, name, update_by || null];
  const result = await pool.query(query, values);
  return result.rows[0];
}
async function getTransactionById(id, userId) {
  const result = await pool.query(
    `SELECT t.*,
            buyer.name AS buyer_name,
            buyer.email AS buyer_email,
            buyer.phone AS buyer_phone,
            buyer.is_verified AS buyer_is_verified,
            seller.name AS seller_name,
            seller.email AS seller_email,
            seller.phone AS seller_phone,
            seller.is_verified AS seller_is_verified,
            t.is_partnership AS is_partnership,
            t.partnership_percentage AS partnership_percentage
     FROM transactions t
     LEFT JOIN users buyer ON t.buyer_id = buyer.id
     LEFT JOIN users seller ON t.seller_id = seller.id
     WHERE t.id = $1
       AND (
         t.buyer_id = $2
         OR t.seller_id = $2
       )`,
    [id, userId]
  );
  return result.rows[0];
}

// Ambil logs status transaksi jika user terkait
async function getTransactionStatusLogsById(transactionId, userId) {
  // // Cek dulu apakah user punya akses ke transaksi ini
  // const trx = await getTransactionById(transactionId, userId);
  // if (!trx) {
  //   // User tidak berhak akses transaksi ini
  //   return null;
  // }

  const result = await pool.query(
    `SELECT * 
     FROM transaction_status_logs 
     WHERE transaction_id = $1
     ORDER BY created_at ASC`,
    [transactionId]
  );
  return result.rows;
}

async function findTransactionByRefId(refId) {
  const query = "SELECT * FROM transactions WHERE kode_transaksi = $1";
  return await pool.query(query, [refId]);
}

async function findTransactionById(id) {
  const query = "SELECT * FROM transactions WHERE id = $1";
  return await pool.query(query, [id]);
}

async function updateTransactionStatus(id, status) {
  const query = `
    UPDATE transactions 
    SET status = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING *
  `;
  return await pool.query(query, [status, id]);
}
module.exports = {
  createTransaction,
  getTransactionsByUserId,
  getTransactionById,
  createTransactionStatusLog,
  getTransactionStatusLogsById,
  findTransactionById,
  updateTransactionStatus,
  findTransactionByRefId,
  getTransactionsByUserIdAll,
  getTransactionByPublicToken,
  attachParticipantsAndActivate
};