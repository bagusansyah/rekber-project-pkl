// controllers/productLinkController.js
// Owner-authenticated management of a seller's Product Payment Links —
// creating a template once, listing them with basic conversion stats, and
// toggling one active/inactive. Actually redeeming a link into a real
// transaction happens in the unauthenticated controllers/publicProductLinkController.js.
const pool = require("../config/db");
const {
  createProductPaymentLink,
  getProductPaymentLinksBySeller,
  getTransactionsForProductLink,
  setProductPaymentLinkActive,
} = require("../models/productPaymentLinkModel");

function buildShareUrl(token) {
  const appUrl = process.env.APP_URL || "https://www.rekber.com";
  return `${appUrl.replace(/\/$/, "")}/buy/${token}`;
}

async function createProductLinkController(req, res) {
  try {
    const sellerId = req.user.id;
    const { name, total_amount, categ_id, fee_by, notes, shipping_option, work_duration } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Nama barang/jasa wajib diisi" });
    }
    if (!total_amount || Number(total_amount) <= 0) {
      return res.status(400).json({ error: "Harga harus lebih dari 0" });
    }
    if (!categ_id) {
      return res.status(400).json({ error: "Kategori wajib dipilih" });
    }

    const sellerDetail = await pool.query(
      "SELECT no_rek FROM user_detail WHERE user_id = $1",
      [sellerId]
    );
    if (!sellerDetail.rows.length || !sellerDetail.rows[0].no_rek) {
      return res.status(400).json({ error: "Seller belum melengkapi nomor rekening di profil." });
    }

    const productLink = await createProductPaymentLink({
      seller_id: sellerId,
      title: name,
      total_amount: Number(total_amount),
      fee_by: fee_by || "buyer",
      categ_id,
      notes,
      product_images: req.files && req.files.length ? req.files.map((f) => f.path) : null,
      shipping_option: shipping_option === "true" || shipping_option === true,
      work_duration: work_duration || null,
    });

    return res.status(201).json({
      id: productLink.id,
      token: productLink.token,
      share_url: buildShareUrl(productLink.token),
      title: productLink.title,
      total_amount: parseFloat(productLink.total_amount),
      is_active: productLink.is_active,
    });
  } catch (err) {
    console.error("Create product link error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function listProductLinksController(req, res) {
  try {
    const sellerId = req.user.id;
    const links = await getProductPaymentLinksBySeller(sellerId);

    return res.status(200).json(
      links.map((link) => ({
        id: link.id,
        token: link.token,
        share_url: buildShareUrl(link.token),
        title: link.title,
        total_amount: parseFloat(link.total_amount),
        fee_by: link.fee_by,
        categ_id: link.categ_id,
        product_images: link.product_images,
        is_active: link.is_active,
        total_transactions: parseInt(link.total_transactions, 10),
        paid_transactions: parseInt(link.paid_transactions, 10),
        created_at: link.created_at,
      }))
    );
  } catch (err) {
    console.error("List product links error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function listProductLinkTransactionsController(req, res) {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const transactions = await getTransactionsForProductLink(id, sellerId);

    return res.status(200).json(
      transactions.map((t) => ({
        id: t.id,
        kode_transaksi: t.kode_transaksi,
        status: t.status,
        total_amount: parseFloat(t.total_amount),
        amount_paid: parseFloat(t.amount_paid),
        buyer_name: t.buyer_name,
        created_at: t.created_at,
      }))
    );
  } catch (err) {
    console.error("List product link transactions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function toggleProductLinkController(req, res) {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const { is_active } = req.body;

    const updated = await setProductPaymentLinkActive(id, sellerId, !!is_active);
    if (!updated) {
      return res.status(404).json({ error: "Product link tidak ditemukan" });
    }

    return res.status(200).json({ id: updated.id, is_active: updated.is_active });
  } catch (err) {
    console.error("Toggle product link error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createProductLinkController,
  listProductLinksController,
  listProductLinkTransactionsController,
  toggleProductLinkController,
};
