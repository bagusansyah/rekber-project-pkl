const pool = require('../config/db');
const { createTransactionStatusLog, getTransactionById } = require('../models/transactionsModel'); 
const { sendEmail } = require('../utils/email');

// Import notification helper
const { createAndSendNotification } = require('../utils/notificationHelper');

async function uploadTransactionShippingController(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { description } = req.body;

    // Validasi transaksi dan hak akses
    const transaction = await getTransactionById(transactionId, userId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    if (transaction.seller_id !== userId) {
      return res.status(403).json({ error: "Hanya seller yang dapat upload bukti pengiriman" });
    }

    // Proses file dari Cloudinary
    let shippingFiles = [];
    if (req.files && req.files.length > 0) {
      shippingFiles = req.files.map(file => ({
        url: file.path,
        secure_url: file.secure_url || file.path,
        public_id: file.public_id,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        width: file.width || null,
        height: file.height || null,
        format: file.format || null,
        uploaded_at: new Date().toISOString()
      }));
    } else {
      return res.status(400).json({ error: "File gambar bukti pengiriman wajib diupload" });
    }

    // Simpan ke database (transaction_shipping)
    const proofs = [];
    for (const file of shippingFiles) {
      const result = await pool.query(
        `INSERT INTO transaction_shipping (transaction_id, seller_id, image_url, description, uploaded_at)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [transactionId, userId, file.secure_url, description]
      );
      proofs.push(result.rows[0]);
    }

    // Log status transaksi
    await createTransactionStatusLog({
      transaction_id: transactionId,
      status: "shipping_proof_uploaded",
      name: "Bukti Pengiriman Diunggah",
      update_by: userId,
      note: `Seller mengunggah bukti pengiriman: ${description || '-'}`
    });

    // SEND NOTIFICATIONS FOR SHIPPING PROOF UPLOAD
    try {
      // Notifikasi ke BUYER
      if (transaction.buyer_id) {
        await createAndSendNotification({
          user_id: transaction.buyer_id,
          title: "Bukti Pengiriman Diterima",
          message: `Penjual telah mengunggah bukti pengiriman untuk transaksi ${transaction.kode_transaksi}. Silakan periksa bukti pengiriman dan konfirmasi jika sudah menerima barang.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: transaction.status,
            description: description || 'Tidak ada deskripsi',
            shipping_proof_count: proofs.length,
            action: "shipping_proof_uploaded"
          }
        });
      }

      // Notifikasi ke SELLER (konfirmasi upload berhasil)
      await createAndSendNotification({
        user_id: userId,
        title: "Bukti Pengiriman Berhasil Diunggah",
        message: `Bukti pengiriman untuk transaksi ${transaction.kode_transaksi} berhasil diunggah. Pembeli akan diberitahu untuk memeriksa bukti pengiriman.`,
        type: "transaction",
        data: {
          transaction_id: transactionId,
          kode_transaksi: transaction.kode_transaksi,
          status: transaction.status,
          description: description || 'Tidak ada deskripsi',
          shipping_proof_count: proofs.length,
          action: "upload_confirmed"
        }
      });

    } catch (notifError) {
      console.error('Error sending shipping proof notifications:', notifError);
    }

    // Kirim email ke buyer
    const buyerUser = await pool.query('SELECT email, name FROM users WHERE id = $1', [transaction.buyer_id]);
    if (buyerUser.rows.length) {
      const buyerEmail = buyerUser.rows[0].email;
      const buyerName = buyerUser.rows[0].name;
      const emailSubject = `Bukti Pengiriman - ${transaction.kode_transaksi}`;
      const emailHtml = `
        <p>Halo ${buyerName},</p>
        <p>Penjual telah mengunggah bukti pengiriman untuk transaksi <b>${transaction.kode_transaksi}</b>.</p>
        ${description ? `<p><strong>Deskripsi:</strong> ${description}</p>` : ''}
        <p>Silakan periksa bukti pengiriman dan konfirmasi penerimaan barang jika sudah diterima.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Bukti Pengiriman</a>
        </div>
      `;
      sendEmail(buyerEmail, emailSubject, emailHtml);
    }

    return res.status(201).json({
      message: "Bukti pengiriman berhasil diupload",
      shipping_proofs: proofs
    });
  } catch (err) {
    console.error('Upload shipping proof error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getTransactionShippingProofsController(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.transactionId;

    // Validasi transaksi dan hak akses
    const transaction = await getTransactionById(transactionId, userId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    // Pastikan user adalah buyer, seller, atau creator
    if (
      transaction.buyer_id !== userId &&
      transaction.seller_id !== userId &&
      transaction.created_by !== userId
    ) {
      return res.status(403).json({ error: "Tidak memiliki akses ke transaksi ini" });
    }

    // Ambil semua bukti pengiriman
    const result = await pool.query(
      `SELECT id, transaction_id, seller_id, image_url, description, uploaded_at
       FROM transaction_shipping
       WHERE transaction_id = $1
       ORDER BY uploaded_at DESC`,
      [transactionId]
    );

    return res.status(200).json({
      shipping_proofs: result.rows
    });
  } catch (err) {
    console.error('Get shipping proofs error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  uploadTransactionShippingController,
  getTransactionShippingProofsController
};