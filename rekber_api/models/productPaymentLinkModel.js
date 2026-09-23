// models/productPaymentLinkModel.js
// Backs the no-code "Product Payment Link": a seller creates one of these
// once per product, gets a permanent token to paste on their own website,
// and every visit that redeems it spawns a fresh transaction (see
// controllers/publicProductLinkController.js).
const pool = require("../config/db");
const crypto = require("crypto");

// Shorter than transactions.public_token (24 bytes) — this token is meant to
// be pasted publicly as a marketing link. Guessing it only lets someone
// start an unwanted draft transaction (no financial exposure), so it doesn't
// need the same length as a payment-claim token.
function generateProductLinkToken() {
  return crypto.randomBytes(12).toString("base64url");
}

async function createProductPaymentLink(data) {
  const {
    seller_id,
    title,
    total_amount,
    fee_by,
    categ_id,
    notes,
    product_images,
    shipping_option,
    shipping_fee,
    work_duration,
  } = data;

  const token = generateProductLinkToken();

  const result = await pool.query(
    `INSERT INTO product_payment_links
      (seller_id, token, title, total_amount, fee_by, categ_id, notes, product_images, shipping_option, shipping_fee, work_duration, created_at, updated_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING *`,
    [
      seller_id,
      token,
      title,
      total_amount,
      fee_by,
      categ_id || null,
      notes || null,
      product_images && product_images.length ? product_images : null,
      !!shipping_option,
      shipping_fee || 0,
      work_duration || null,
    ]
  );
  return result.rows[0];
}

// Returns the row regardless of is_active — callers decide how to message
// an inactive vs. a genuinely missing link.
async function findProductPaymentLinkByToken(token) {
  const result = await pool.query(
    `SELECT ppl.*, seller.name AS seller_name, seller.is_verified AS seller_is_verified
     FROM product_payment_links ppl
     LEFT JOIN users seller ON ppl.seller_id = seller.id
     WHERE ppl.token = $1`,
    [token]
  );
  return result.rows[0] || null;
}

async function getProductPaymentLinksBySeller(sellerId) {
  const result = await pool.query(
    `SELECT ppl.*,
            COUNT(t.id) AS total_transactions,
            COUNT(t.id) FILTER (WHERE t.status NOT IN ('draft', 'cancel', 'cancelled')) AS paid_transactions
     FROM product_payment_links ppl
     LEFT JOIN transactions t ON t.product_link_id = ppl.id
     WHERE ppl.seller_id = $1
     GROUP BY ppl.id
     ORDER BY ppl.created_at DESC`,
    [sellerId]
  );
  return result.rows;
}

// Transactions spawned by one product link, scoped to its owning seller —
// backs the "lihat transaksi" drill-down on the product-links dashboard page.
async function getTransactionsForProductLink(linkId, sellerId) {
  const result = await pool.query(
    `SELECT t.id, t.kode_transaksi, t.status, t.total_amount, t.amount_paid, t.created_at,
            buyer.name AS buyer_name
     FROM transactions t
     JOIN product_payment_links ppl ON t.product_link_id = ppl.id
     LEFT JOIN users buyer ON t.buyer_id = buyer.id
     WHERE t.product_link_id = $1 AND ppl.seller_id = $2
     ORDER BY t.created_at DESC`,
    [linkId, sellerId]
  );
  return result.rows;
}

async function setProductPaymentLinkActive(id, sellerId, isActive) {
  const result = await pool.query(
    `UPDATE product_payment_links
     SET is_active = $1, updated_at = NOW()
     WHERE id = $2 AND seller_id = $3
     RETURNING *`,
    [isActive, id, sellerId]
  );
  return result.rows[0] || null;
}

module.exports = {
  createProductPaymentLink,
  findProductPaymentLinkByToken,
  getProductPaymentLinksBySeller,
  getTransactionsForProductLink,
  setProductPaymentLinkActive,
};
