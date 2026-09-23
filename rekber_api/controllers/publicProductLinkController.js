// controllers/publicProductLinkController.js
// Unauthenticated endpoints backing the public "Product Payment Link" page
// (/buy/:token on the frontend): anyone can view a product summary, and
// clicking through spawns a brand-new draft transaction each time — unlike
// the single-use Payment Link, this link is meant to be reused by many
// different buyers.
const pool = require("../config/db");
const {
  findProductPaymentLinkByToken,
} = require("../models/productPaymentLinkModel");
const {
  createTransaction,
  createTransactionStatusLog,
} = require("../models/transactionsModel");
const { getFeeRuleByAmount } = require("../models/feeRulesModel");

async function computeFee(totalAmount) {
  const feeRule = await getFeeRuleByAmount(Math.round(totalAmount));
  if (!feeRule) return null;

  let fee_amount = totalAmount * (Number(feeRule.fee_percent) / 100);
  if (feeRule.min_fee && fee_amount < Number(feeRule.min_fee)) {
    fee_amount = Number(feeRule.min_fee);
  }
  return Math.round(fee_amount);
}

async function getProductLinkSummaryController(req, res) {
  try {
    const { token } = req.params;
    const link = await findProductPaymentLinkByToken(token);

    if (!link) {
      return res.status(404).json({ error: "Link produk tidak ditemukan" });
    }

    const totalAmount = parseFloat(link.total_amount);
    const feeAmount = await computeFee(totalAmount);

    return res.status(200).json({
      title: link.title,
      notes: link.notes,
      categ_id: link.categ_id,
      product_images: link.product_images,
      total_amount: totalAmount,
      fee_amount: feeAmount || 0,
      fee_by: link.fee_by,
      seller_name: link.seller_name,
      seller_is_verified: !!link.seller_is_verified,
      is_active: link.is_active,
    });
  } catch (err) {
    console.error("Get product link summary error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function redeemProductLinkController(req, res) {
  try {
    const { token } = req.params;
    const link = await findProductPaymentLinkByToken(token);

    if (!link) {
      return res.status(404).json({ error: "Link produk tidak ditemukan" });
    }
    if (!link.is_active) {
      return res.status(400).json({ error: "Link produk ini sudah tidak aktif" });
    }

    // Re-check: the seller may have removed their bank details after
    // publishing this link.
    const sellerDetail = await pool.query(
      "SELECT no_rek FROM user_detail WHERE user_id = $1",
      [link.seller_id]
    );
    if (!sellerDetail.rows.length || !sellerDetail.rows[0].no_rek) {
      return res.status(400).json({ error: "Penjual belum melengkapi nomor rekening, coba lagi nanti." });
    }

    const totalAmount = parseFloat(link.total_amount);
    const feeAmount = await computeFee(totalAmount);
    if (feeAmount === null) {
      return res.status(400).json({ error: "Fee rule tidak ditemukan" });
    }

    const amountPaid = link.fee_by === "buyer" ? totalAmount + feeAmount : totalAmount;
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const transaction = await createTransaction({
      title: link.title,
      buyer_id: null,
      seller_id: link.seller_id,
      status: "draft",
      total_amount: totalAmount,
      fee_amount: feeAmount,
      amount_paid: amountPaid,
      is_funded: false,
      funded_at: null,
      notes: link.notes,
      created_by: link.seller_id,
      roles: "penjual",
      fee_by: link.fee_by,
      categ_id: link.categ_id,
      shipping_option: link.shipping_option,
      shipping_fee: link.shipping_fee ? Math.round(Number(link.shipping_fee)) : 0,
      work_duration: link.work_duration,
      voucher_id: null,
      voucher_discount: 0,
      expired_at: expiredAt,
      product_images: link.product_images,
      product_link_id: link.id,
    });

    await createTransactionStatusLog({
      transaction_id: transaction.id,
      status: "draft",
      name: "Transaksi dibuat dari Product Payment Link",
      update_by: link.seller_id,
      note: `Transaksi ${transaction.kode_transaksi} dibuat otomatis dari link produk ${token}`,
    });

    return res.status(200).json({ public_token: transaction.public_token });
  } catch (err) {
    console.error("Redeem product link error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getProductLinkSummaryController,
  redeemProductLinkController,
};
