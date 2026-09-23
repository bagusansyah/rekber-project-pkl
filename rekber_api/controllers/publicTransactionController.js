// controllers/publicTransactionController.js
// Unauthenticated endpoints backing the public "Payment Link" page: anyone with
// the link can view a draft transaction's summary and pay it after providing
// their name/email/phone, without needing an account first.
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  getTransactionByPublicToken,
  attachParticipantsAndActivate,
} = require("../models/transactionsModel");
const {
  createUser,
  createUserDetail,
  activateUser,
  findUserByEmail,
  findUserByPhone,
  findUserById,
} = require("../models/userModel");
const { sendEmail } = require("../utils/email");
const { createAndSendNotification } = require("../utils/notificationHelper");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isExpired(transaction) {
  return !!transaction.expired_at && new Date(transaction.expired_at) < new Date();
}

// Sebuah transaksi hanya bisa "diklaim" (diisi sebagai buyer) selama masih draft,
// slot buyer masih kosong, ada seller yang menunggu, dan belum kadaluarsa.
function isClaimable(transaction) {
  return (
    !!transaction &&
    transaction.status === "draft" &&
    !transaction.buyer_id &&
    !!transaction.seller_id &&
    !isExpired(transaction)
  );
}

// Jika pengunjung Payment Link sudah punya sesi login (Authorization: Bearer
// <token> valid), pakai identitas itu langsung alih-alih form tamu. Token yang
// hilang/tidak valid/kedaluwarsa hanya berarti "belum login" (bukan error).
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
    const result = await findUserById(decoded.id);
    return result.rows[0] || null;
  } catch (err) {
    return null;
  }
}

async function notifySellerWaitingPayment(transaction) {
  try {
    await createAndSendNotification({
      user_id: transaction.seller_id,
      title: "Transaksi Menunggu Pembayaran",
      message: `Transaksi ${transaction.kode_transaksi} telah dibayar melalui Payment Link dan menunggu pembayaran dari pembeli.`,
      type: "transaction",
      data: {
        transaction_id: transaction.id,
        kode_transaksi: transaction.kode_transaksi,
        status: "wait_payment",
        amount: transaction.amount_paid,
        action: "waiting_buyer_payment",
      },
    });
  } catch (notifError) {
    console.error("Error sending public claim notification:", notifError);
  }
}

async function getPublicTransactionSummary(req, res) {
  try {
    const { token } = req.params;
    const transaction = await getTransactionByPublicToken(token);

    if (!transaction) {
      return res.status(404).json({ error: "Link pembayaran tidak ditemukan" });
    }

    return res.status(200).json({
      id: transaction.id,
      kode_transaksi: transaction.kode_transaksi,
      title: transaction.title,
      notes: transaction.notes,
      categ_id: transaction.categ_id,
      total_amount: parseFloat(transaction.total_amount),
      fee_amount: parseFloat(transaction.fee_amount || 0),
      amount_paid: parseFloat(transaction.amount_paid),
      fee_by: transaction.fee_by,
      status: transaction.status,
      seller_name: transaction.seller_name,
      seller_is_verified: !!transaction.seller_is_verified,
      expired_at: transaction.expired_at,
      is_claimed: !!transaction.buyer_id,
      is_expired: isExpired(transaction),
      is_claimable: isClaimable(transaction),
    });
  } catch (err) {
    console.error("Get public transaction summary error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function claimPublicTransaction(req, res) {
  try {
    const { token } = req.params;

    const transaction = await getTransactionByPublicToken(token);
    if (!transaction) {
      return res.status(404).json({ error: "Link pembayaran tidak ditemukan" });
    }
    if (isExpired(transaction)) {
      return res.status(400).json({ error: "Link pembayaran ini sudah kadaluarsa", code: "EXPIRED" });
    }
    if (transaction.status !== "draft" || transaction.buyer_id) {
      return res.status(400).json({ error: "Link pembayaran ini sudah digunakan", code: "ALREADY_CLAIMED" });
    }
    if (!transaction.seller_id) {
      return res.status(400).json({ error: "Transaksi ini belum siap dibayar" });
    }

    // Sudah login? Langsung pasang akun yang sedang login sebagai buyer,
    // tanpa form nama/email/no HP.
    const loggedInUser = await getUserFromAuthHeader(req);
    if (loggedInUser) {
      if (Number(loggedInUser.id) === Number(transaction.seller_id)) {
        return res.status(400).json({ error: "Tidak dapat membayar transaksi milik sendiri" });
      }

      await attachParticipantsAndActivate(transaction, loggedInUser.id, transaction.seller_id, loggedInUser.id);
      await notifySellerWaitingPayment(transaction);

      return res.status(200).json({
        transactionId: transaction.id,
        usedExistingAccount: true,
      });
    }

    // --- Belum login: wajib isi nama, email, dan no HP (alur tamu) ---
    const name = (req.body.name || "").trim();
    const phone = (req.body.phone || "").trim();
    const email = (req.body.email || "").trim();

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Nama, email, dan nomor HP wajib diisi" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Format email tidak sesuai" });
    }

    const normalizedEmail = email.toLowerCase();

    if (transaction.seller_email && transaction.seller_email.toLowerCase() === normalizedEmail) {
      return res.status(400).json({ error: "Tidak dapat membayar transaksi milik sendiri" });
    }

    const existingByEmail = await findUserByEmail(normalizedEmail);
    const existingByPhone = await findUserByPhone(phone);
    if (existingByEmail.rows.length || existingByPhone.rows.length) {
      return res.status(409).json({
        error: "Email atau nomor HP sudah terdaftar. Silakan login untuk melanjutkan pembayaran.",
        code: "ACCOUNT_EXISTS",
        transactionId: transaction.id,
      });
    }

    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const user = await createUser(name, normalizedEmail, hashedPassword, null, phone);
    await createUserDetail({ user_id: user.id });
    await activateUser(user.id);

    await attachParticipantsAndActivate(transaction, user.id, transaction.seller_id, user.id);
    await notifySellerWaitingPayment(transaction);

    sendEmail(
      normalizedEmail,
      `Akun Rekber.com Anda & Transaksi ${transaction.kode_transaksi}`,
      `
      <p>Halo ${name},</p>
      <p>Kami membuatkan akun Rekber.com untuk Anda agar bisa melanjutkan transaksi <b>${transaction.kode_transaksi}</b> yang dibagikan kepada Anda.</p>
      <p>Silakan lakukan pembayaran sesuai instruksi pada halaman transaksi.</p>
      <p>Jika ingin login kembali nanti, gunakan email ini dan buat password baru melalui menu "Lupa Password".</p>
      <a href="https://www.rekber.com/dashboard/transactions/${transaction.id}">Lihat Detail Transaksi</a>
      `,
    ).catch((emailError) => {
      console.error("Error sending public claim welcome email:", emailError);
    });

    const jwtToken = jwt.sign({ id: user.id, email: normalizedEmail }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return res.status(200).json({
      token: jwtToken,
      id: user.id,
      name,
      email: normalizedEmail,
      transactionId: transaction.id,
    });
  } catch (err) {
    console.error("Claim public transaction error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getPublicTransactionSummary,
  claimPublicTransaction,
};
