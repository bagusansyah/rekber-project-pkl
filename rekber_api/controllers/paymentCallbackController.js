// controllers/paymentCallbackController.js
const { createPaymentCallback, findCallbackByExternalId, updateCallbackStatus } = require("../models/paymentCallbackModel");
const { findTransactionById, updateTransactionStatus, findTransactionByRefId, createTransactionStatusLog } = require("../models/transactionsModel");
const { findUserById } = require("../models/userModel");
const { sendEmail } = require("../utils/email");
const crypto = require("crypto");

// Import notification helper
const { createAndSendNotification } = require('../utils/notificationHelper');

// API Key validation middleware
const VALID_API_KEY = "a14934d87baa20d04fa589c31ce8cb066706296e949bad73e12dabab37d7d008";

function validateApiKey(req, res, next) {
  const apiKey = req.headers['apikey'] || req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: "API Key is required",
      status: false 
    });
  }

  // Remove 'Bearer ' prefix if present
  const cleanApiKey = apiKey.replace(/^Bearer\s+/i, '');

  if (cleanApiKey !== VALID_API_KEY) {
    console.log('Invalid API Key attempt:', cleanApiKey);
    return res.status(401).json({ 
      error: "Invalid API Key",
      status: false 
    });
  }

  next();
}

async function handlePaymentCallback(req, res) {
  try {
    // Validate API Key first
    const apiKey = req.headers['apikey'] || req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== VALID_API_KEY) {
      console.log('Payment callback - Invalid API Key:', apiKey);
      return res.status(401).json({ 
        error: "Unauthorized - Invalid API Key",
        status: false 
      });
    }

    const {
      trxid,
      refid,
      va_number,
      desc,
      channel,
      paid_amount, 
      trx_date
    } = req.body;

    console.log('Payment callback received:', {
      ...req.body,
      headers: {
        apikey: apiKey ? 'VALID' : 'MISSING',
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for']
      }
    });

    // Validasi data yang diperlukan
    if (!trxid || !paid_amount || !refid) {
      return res.status(400).json({ 
        error: "Missing required fields: trxid, paid_amount, refid",
        status: false 
      });
    }

    // Extract transaction_id dari refid atau trxid
    let transactionId = refid;
    
    if (!transactionId) {
      return res.status(400).json({ 
        error: "Invalid transaction reference",
        status: false 
      });
    }

    // Cek apakah transaksi ada
    const transaction = await findTransactionByRefId(transactionId);
    if (transaction.rows.length === 0) {
      return res.status(404).json({ 
        error: "Transaction not found",
        status: false 
      });
    }

    // Cek apakah callback sudah pernah diproses
    const existingCallback = await findCallbackByExternalId(trxid, 'payment_gateway');
    if (existingCallback.rows.length > 0) {
      const callback = existingCallback.rows[0];
      if (callback.status === 'PAID' && callback.is_verified) {
        return res.status(200).json({ 
          message: "Callback already processed",
          status: true 
        });
      }
    }

    // Validasi amount (opsional - sesuaikan dengan kebutuhan)
    const expectedAmount = parseFloat(transaction.rows[0].amount_paid || transaction.rows[0].amount);
    const receivedAmount = parseFloat(paid_amount);
    
    if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
      console.warn(`Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`);
      // Bisa dipilih untuk reject atau tidak
      // return res.status(400).json({ error: "Amount mismatch", status: false });
    }

    // Prepare callback data
    const callbackData = {
      transaction_id: transactionId,
      payment_gateway: 'payment_gateway', // sesuaikan dengan nama gateway
      external_id: trxid,
      payment_method: channel || 'bank_transfer',
      status: 'PAID', // karena callback biasanya hanya untuk pembayaran sukses
      amount: receivedAmount,
      currency: 'IDR',
      fee: 0,
      net_amount: receivedAmount,
      reference_id: refid,
      payment_channel: channel,
      bank_code: channel,
      va_number: va_number,
      qr_string: null,
      ewallet_type: null,
      raw_data: req.body,
      signature: req.headers['x-signature'] || req.headers['authorization'],
      is_verified: true // set true jika tidak ada validasi signature khusus
    };

    // Simpan callback ke database
    const savedCallback = await createPaymentCallback(callbackData);

    // Update status transaksi menjadi paid
    await updateTransactionStatus(transaction.rows[0].id, 'paid');

    // Update callback status sebagai processed
    await updateCallbackStatus(savedCallback.id, 'PROCESSED', new Date());

    await createTransactionStatusLog({
      transaction_id: transaction.rows[0].id,
      status: "paid",
      name: "Sudah Dibayar",
      update_by: transaction.rows[0].seller_id,
      note: `Transaksi ${transaction.rows[0].kode_transaksi} sudah dibayar`,
    });

    await createTransactionStatusLog({
      transaction_id: transaction.rows[0].id,
      status: "waiting_confirmation",
      name: "Menunggu Pengiriman Barang",
      update_by: transaction.rows[0].seller_id,
      note: `Menunggu konfirmasi barang dan penyelesaian transaksi pembeli.`,
    });

    // SEND NOTIFICATIONS
    try {
      const transactionData = transaction.rows[0];

      // Notifikasi ke BUYER - Pembayaran berhasil
      if (transactionData.buyer_id) {
        await createAndSendNotification({
          user_id: transactionData.buyer_id,
          title: "Pembayaran Berhasil",
          message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} telah berhasil dikonfirmasi. Silakan tunggu seller mengirimkan barang/jasa.`,
          type: "payment",
          data: {
            transaction_id: transactionData.id,
            kode_transaksi: transactionData.kode_transaksi,
            status: "paid",
            amount: receivedAmount,
            payment_method: channel || 'bank_transfer',
            action: "payment_success"
          }
        });
      }

      // Notifikasi ke SELLER - Pembayaran diterima
      if (transactionData.seller_id) {
        await createAndSendNotification({
          user_id: transactionData.seller_id,
          title: "Pembayaran Diterima",
          message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} telah diterima. Silakan segera kirimkan barang/jasa kepada pembeli.`,
          type: "payment",
          data: {
            transaction_id: transactionData.id,
            kode_transaksi: transactionData.kode_transaksi,
            status: "paid",
            amount: receivedAmount,
            payment_method: channel || 'bank_transfer',
            action: "payment_received"
          }
        });
      }

      console.log(`Payment notifications sent for transaction ${transactionData.kode_transaksi}`);

    } catch (notifError) {
      console.error('Error sending payment notifications:', notifError);
      // Don't fail the callback for notification errors
    }

    // Kirim email notifikasi
    await sendPaymentNotificationEmails(transaction.rows[0]);

    return res.status(200).json({ 
      message: "Payment callback processed successfully",
      status: true,
      transaction_id: transactionId,
      callback_id: savedCallback.id
    });

  } catch (err) {
    console.error('Payment callback error:', err);
    return res.status(500).json({ 
      error: "Internal server error",
      status: false 
    });
  }
}

// API untuk notify status manual (untuk testing)
async function notifyPaymentStatus(req, res) {
  try {
    // Validate API Key for manual testing
    const apiKey = req.headers['apikey'] || req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== VALID_API_KEY) {
      return res.status(401).json({ 
        error: "Unauthorized - Invalid API Key",
        status: false 
      });
    }

    const { transaction_id, status, trxid, amount } = req.body;

    if (!transaction_id || !status) {
      return res.status(400).json({ 
        error: "transaction_id and status are required",
        status: false 
      });
    }

    // Cari transaksi
    const transaction = await findTransactionById(transaction_id);
    if (transaction.rows.length === 0) {
      return res.status(404).json({ 
        error: "Transaction not found",
        status: false 
      });
    }

    // Simpan callback manual
    const callbackData = {
      transaction_id,
      payment_gateway: 'manual',
      external_id: trxid || `manual_${transaction_id}_${Date.now()}`,
      status: status.toUpperCase(),
      amount: amount || transaction.rows[0].amount,
      currency: 'IDR',
      payment_method: 'manual_update',
      is_verified: true,
      raw_data: req.body
    };

    const savedCallback = await createPaymentCallback(callbackData);

    // Process berdasarkan status dan SEND NOTIFICATIONS
    if (status.toUpperCase() === 'PAID' || status.toUpperCase() === 'SUCCESS') {
      await updateTransactionStatus(transaction_id, 'paid');

      // SEND NOTIFICATIONS FOR PAID STATUS
      try {
        const transactionData = transaction.rows[0];

        // Notifikasi ke BUYER
        if (transactionData.buyer_id) {
          await createAndSendNotification({
            user_id: transactionData.buyer_id,
            title: "Pembayaran Dikonfirmasi",
            message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} telah dikonfirmasi secara manual. Silakan tunggu seller mengirimkan barang/jasa.`,
            type: "payment",
            data: {
              transaction_id: transactionData.id,
              kode_transaksi: transactionData.kode_transaksi,
              status: "paid",
              amount: amount || transactionData.amount,
              action: "manual_payment_confirmed"
            }
          });
        }

        // Notifikasi ke SELLER
        if (transactionData.seller_id) {
          await createAndSendNotification({
            user_id: transactionData.seller_id,
            title: "Pembayaran Dikonfirmasi",
            message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} telah dikonfirmasi. Silakan segera kirimkan barang/jasa kepada pembeli.`,
            type: "payment",
            data: {
              transaction_id: transactionData.id,
              kode_transaksi: transactionData.kode_transaksi,
              status: "paid",
              amount: amount || transactionData.amount,
              action: "manual_payment_received"
            }
          });
        }

      } catch (notifError) {
        console.error('Error sending manual payment notifications:', notifError);
      }

      await sendPaymentNotificationEmails(transaction.rows[0]);

    } else if (status.toUpperCase() === 'FAILED' || status.toUpperCase() === 'EXPIRED') {
      await updateTransactionStatus(transaction_id, 'failed');

      // SEND NOTIFICATIONS FOR FAILED STATUS
      try {
        const transactionData = transaction.rows[0];

        // Notifikasi ke BUYER
        if (transactionData.buyer_id) {
          await createAndSendNotification({
            user_id: transactionData.buyer_id,
            title: "Pembayaran Gagal",
            message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} gagal. Silakan coba lagi atau hubungi customer service.`,
            type: "payment",
            data: {
              transaction_id: transactionData.id,
              kode_transaksi: transactionData.kode_transaksi,
              status: "failed",
              reason: status,
              action: "payment_failed"
            }
          });
        }

        // Notifikasi ke SELLER
        if (transactionData.seller_id) {
          await createAndSendNotification({
            user_id: transactionData.seller_id,
            title: "Pembayaran Gagal",
            message: `Pembayaran untuk transaksi ${transactionData.kode_transaksi} gagal. Transaksi dibatalkan.`,
            type: "payment",
            data: {
              transaction_id: transactionData.id,
              kode_transaksi: transactionData.kode_transaksi,
              status: "failed",
              reason: status,
              action: "payment_failed"
            }
          });
        }

      } catch (notifError) {
        console.error('Error sending payment failure notifications:', notifError);
      }
    }

    return res.status(200).json({
      message: "Payment status updated successfully",
      status: true,
      callback_id: savedCallback.id
    });

  } catch (err) {
    console.error('Notify payment status error:', err);
    return res.status(500).json({ 
      error: "Internal server error",
      status: false 
    });
  }
}

async function sendPaymentNotificationEmails(transaction) {
  try {
    // Email ke buyer
    const buyerUser = await findUserById(transaction.buyer_id);
    if (buyerUser.rows.length) {
      const buyerEmail = buyerUser.rows[0].email;
      const buyerName = buyerUser.rows[0].name;
      const buyerSubject = `Pembayaran Berhasil - ${transaction.kode_transaksi}`;
      const buyerHtml = `
        <p>Halo ${buyerName},</p>
        <p>Pembayaran untuk transaksi <b>${transaction.kode_transaksi}</b> telah berhasil dikonfirmasi.</p>
        <p>Jumlah: <b>Rp${parseFloat(transaction.total_amount).toLocaleString("id-ID")}</b></p>
        <p>Tanggal Pembayaran: <b>${new Date().toLocaleDateString('id-ID')}</b></p>
        <p>Silakan tunggu seller mengirimkan barang/jasa yang telah dibeli.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transaction.id}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      await sendEmail(buyerEmail, buyerSubject, buyerHtml);
    }

    // Email ke seller
    const sellerUser = await findUserById(transaction.seller_id);
    if (sellerUser.rows.length) {
      const sellerEmail = sellerUser.rows[0].email;
      const sellerName = sellerUser.rows[0].name;
      const sellerSubject = `Pembayaran Diterima - ${transaction.kode_transaksi}`;
      const sellerHtml = `
        <p>Halo ${sellerName},</p>
        <p>Pembayaran untuk transaksi <b>${transaction.kode_transaksi}</b> telah diterima.</p>
        <p>Jumlah: <b>Rp${parseFloat(transaction.total_amount).toLocaleString("id-ID")}</b></p>
        <p>Tanggal Pembayaran: <b>${new Date().toLocaleDateString('id-ID')}</b></p>
        <p>Silakan segera kirimkan barang/jasa kepada pembeli dan konfirmasi pengiriman melalui sistem.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transaction.id}" class="button">Konfirmasi Pengiriman</a>
        </div>
      `;
      await sendEmail(sellerEmail, sellerSubject, sellerHtml);
    }
  } catch (err) {
    console.error('Send payment notification emails error:', err);
  }
}

module.exports = {
  handlePaymentCallback,
  notifyPaymentStatus,
  validateApiKey // Export the middleware for use in routes
};