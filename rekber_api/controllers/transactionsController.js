const {
  createTransaction,
  getTransactionsByUserId,
  getTransactionsByUserIdAll,
  createTransactionStatusLog,
  getTransactionById,
  getTransactionStatusLogsById,
  attachParticipantsAndActivate,
} = require("../models/transactionsModel");
const {
  findUserByEmail,
  findUserByNoHp,
  findUserById,
} = require("../models/userModel");
const { getFeeRuleByAmount } = require("../models/feeRulesModel");
const { sendEmail } = require("../utils/email");
const {
  createVirtualAccount,
  findVAByRefidAndChannel,
} = require("../models/virtualAccountModel");
const pool = require("../config/db");
const crypto = require("crypto");
const { createAndSendNotification } = require("../utils/notificationHelper");

// Helper function to calculate next working day
function calculateNextWorkingDay(date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
}

async function getAdminEmails() {
  try {
    const adminQuery = await pool.query(
      "SELECT email FROM users WHERE is_admin = 1 AND email IS NOT NULL",
    );
    return adminQuery.rows.map((row) => row.email);
  } catch (error) {
    console.error("Error getting admin emails:", error);
    return ["admin@rekber.com"];
  }
}

async function createTransactionController(req, res) {
  try {
    const {
      name,
      email,
      role,
      total_amount,
      notes,
      fee_by,
      status,
      categ_id,
      shipping_option,
      shipping_fee,
      work_duration,
      voucher_code,
    } = req.body;

    const myId = req.user.id;
    const myRole = role;
    let buyer_id,
      seller_id,
      otherUser = null,
      voucherData = null,
      voucherDiscount = 0;
    const myUser = await findUserById(myId);

    if (status === "draft") {
      if (myRole === "pembeli") {
        buyer_id = myId;
        seller_id = null;
      } else if (myRole === "penjual") {
        buyer_id = null;
        seller_id = myId;
      } else {
        return res.status(400).json({ error: "Role tidak valid" });
      }
    } else {
      if (!email)
        return res
          .status(400)
          .json({ error: "Email lawan transaksi wajib diisi" });

      if (myUser.rows[0].email === email) {
        return res
          .status(400)
          .json({
            error: "Tidak dapat membuat transaksi dengan email yang sama",
          });
      }

      const userResult = await findUserByEmail(email);
      const userResultNoHP = await findUserByNoHp(email);

      if (!userResult.rows.length && !userResultNoHP.rows.length) {
        return res
          .status(404)
          .json({
            error: "Email atau No HP Penjual / Pembeli tidak ditemukan",
          });
      }
      otherUser = userResult.rows.length
        ? userResult.rows[0]
        : userResultNoHP.rows[0];

      if (Number(otherUser.id) === Number(myId)) {
        return res.status(400).json({
          error: "Pembeli dan penjual tidak boleh menggunakan akun yang sama",
        });
      }

      // SECURITY FIX: Move role-based assignment BEFORE the invariant check
      if (myRole === "pembeli") {
        buyer_id = myId;
        seller_id = otherUser.id;
      } else if (myRole === "penjual") {
        buyer_id = otherUser.id;
        seller_id = myId;
      } else {
        return res.status(400).json({ error: "Role tidak valid" });
      }

      // SECURITY FIX: Now check the invariant AFTER IDs are assigned
      if (buyer_id && seller_id && Number(buyer_id) === Number(seller_id)) {
        return res.status(400).json({
          error: "Pembeli dan penjual tidak boleh menggunakan akun yang sama",
        });
      }
    }

    if (voucher_code) {
      const voucherQuery = await pool.query(
        `
        SELECT * FROM vouchers WHERE code = $1 AND is_active = true
      `,
        [voucher_code.toUpperCase()],
      );

      if (voucherQuery.rows.length === 0) {
        return res
          .status(400)
          .json({ error: "Kode voucher tidak valid atau sudah tidak aktif" });
      }

      voucherData = voucherQuery.rows[0];
      if (voucherData.used_count >= voucherData.usage_limit) {
        return res
          .status(400)
          .json({ error: "Voucher sudah mencapai batas penggunaan" });
      }

      voucherDiscount = parseFloat(voucherData.value);
      if (voucherDiscount > Number(total_amount)) {
        return res
          .status(400)
          .json({
            error:
              "Diskon voucher tidak boleh lebih besar dari total transaksi",
          });
      }
    }

    if (seller_id) {
      const sellerDetail = await pool.query(
        "SELECT no_rek FROM user_detail WHERE user_id = $1",
        [seller_id],
      );
      if (!sellerDetail.rows.length || !sellerDetail.rows[0].no_rek) {
        return res
          .status(400)
          .json({ error: "Seller belum melengkapi nomor rekening di profil." });
      }
    }

    if (buyer_id) {
      const buyerDetail = await pool.query(
        "SELECT no_rek FROM user_detail WHERE user_id = $1",
        [buyer_id],
      );
      if (!buyerDetail.rows.length || !buyerDetail.rows[0].no_rek) {
        return res
          .status(400)
          .json({ error: "Buyer belum melengkapi nomor rekening di profil." });
      }
    }

    const totalAfterVoucher = Number(total_amount) - voucherDiscount;
    const feeRule = await getFeeRuleByAmount(Math.round(totalAfterVoucher));
    if (!feeRule) {
      return res.status(400).json({ error: "Fee rule tidak ditemukan" });
    }

    let fee_amount = totalAfterVoucher * (Number(feeRule.fee_percent) / 100);
    if (feeRule.min_fee && fee_amount < Number(feeRule.min_fee)) {
      fee_amount = Number(feeRule.min_fee);
    }
    fee_amount = Math.round(fee_amount);

    let amount_paid;
    if (fee_by === "buyer") {
      amount_paid = totalAfterVoucher + fee_amount;
    } else if (fee_by === "seller") {
      amount_paid = totalAfterVoucher;
    } else {
      return res.status(400).json({ error: "fee_by harus buyer atau seller" });
    }

    const now = new Date();
    const expiredDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    let is_partnership = false;
    let partnership_percentage = 0;
    let fee_partnership = 0;

    if (seller_id) {
      const sellerUser = Number(seller_id) === Number(myId)
        ? myUser.rows[0]
        : otherUser;

      if (sellerUser) {
        const isPartner = sellerUser.is_partnership || false;
        const expiresAt = sellerUser.partnership_expires_at;
        const isExpired = expiresAt && new Date(expiresAt) < new Date();

        if (isPartner && !isExpired) {
          is_partnership = true;
          partnership_percentage = parseFloat(sellerUser.partnership_percentage || 0);
          fee_partnership = Math.round((fee_amount * partnership_percentage) / 100);
        }
      }
    }

    const data = {
      title: name,
      buyer_id,
      seller_id,
      status,
      total_amount: Number(total_amount),
      fee_amount,
      amount_paid,
      is_funded: false,
      funded_at: null,
      notes,
      created_by: myId,
      fee_by,
      roles: myRole,
      categ_id,
      shipping_option: !!shipping_option,
      shipping_fee: shipping_fee ? Number(shipping_fee) : 0,
      work_duration: work_duration ? Number(work_duration) : null,
      voucher_id: voucherData ? voucherData.id : null,
      voucher_discount: voucherDiscount,
      expired_at: expiredDate,
      is_partnership,
      partnership_percentage,
      fee_partnership,
      product_images: req.files && req.files.length ? req.files.map((f) => f.path) : null,
    };

    const transaction = await createTransaction(data);

    if (voucherData && voucherDiscount > 0) {
      await pool.query(
        `
        UPDATE vouchers SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1
      `,
        [voucherData.id],
      );

      await pool.query(
        `
        INSERT INTO voucher_usage (voucher_id, user_id, transaction_id, discount_amount)
        VALUES ($1, $2, $3, $4)
      `,
        [voucherData.id, myId, transaction.id, voucherDiscount],
      );
    }

    const userResultid = await findUserById(myId);
    const roleText =
      myRole === "penjual" ? "sebagai penjual" : "sebagai pembeli";
    let note = `Transaksi ${transaction.kode_transaksi} telah dibuat oleh ${userResultid.rows[0].name} ${roleText}`;

    if (voucherData) {
      note += `. Menggunakan voucher ${voucherData.code} dengan diskon Rp ${voucherDiscount.toLocaleString("id-ID")}`;
    }

    if (status === "draft") {
      await createTransactionStatusLog({
        transaction_id: transaction.id,
        status: "draft",
        name: "Transaksi dibuat",
        update_by: req.user.id,
        note,
      });

      try {
        await createAndSendNotification({
          user_id: myId,
          title: "Transaksi Draft Dibuat",
          message: `Transaksi ${transaction.kode_transaksi} berhasil dibuat sebagai draft. Lengkapi data untuk melanjutkan ke pembayaran.`,
          type: "transaction",
          data: {
            transaction_id: transaction.id,
            kode_transaksi: transaction.kode_transaksi,
            status: "draft",
            amount: amount_paid,
            action: "draft_created",
          },
        });
      } catch (notifError) {
        console.error("Error sending draft notification:", notifError);
      }
    } else if (status === "wait_payment") {
      await createTransactionStatusLog({
        transaction_id: transaction.id,
        status: "wait_payment",
        name: "Menunggu pembayaran",
        update_by: req.user.id,
        note: `Transaksi ${transaction.kode_transaksi} diupdate ke waiting payment`,
      });

      try {
        if (buyer_id) {
          await createAndSendNotification({
            user_id: buyer_id,
            title: "Transaksi Menunggu Pembayaran",
            message: `Transaksi ${transaction.kode_transaksi} telah dibuat dan menunggu pembayaran. Silakan lakukan pembayaran sesuai instruksi.`,
            type: "transaction",
            data: {
              transaction_id: transaction.id,
              kode_transaksi: transaction.kode_transaksi,
              status: "wait_payment",
              amount: amount_paid,
              action: "payment_required",
            },
          });
        }

        if (seller_id) {
          await createAndSendNotification({
            user_id: seller_id,
            title: "Transaksi Baru",
            message: `Transaksi ${transaction.kode_transaksi} telah dibuat dan menunggu pembayaran dari pembeli.`,
            type: "transaction",
            data: {
              transaction_id: transaction.id,
              kode_transaksi: transaction.kode_transaksi,
              status: "wait_payment",
              amount: amount_paid,
              action: "transaction_created",
            },
          });
        }
      } catch (notifError) {
        console.error("Error sending wait_payment notifications:", notifError);
      }
    }

    if (transaction.buyer_id === myId) {
      delete transaction.partnership_percentage;
      delete transaction.fee_partnership;
    }

    return res.status(201).json({
      message: "Transaction created",
      transaction: {
        ...transaction,
        fee_by,
        roles: myRole,
        voucher_applied: voucherData
          ? {
              code: voucherData.code,
              discount: voucherDiscount,
              original_total: Number(total_amount),
              final_total: amount_paid,
            }
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateTransactionToWaitingPaymentController(req, res) {
  try {
    const { transaction_id, email } = req.body;
    const myId = req.user.id;

    const transaction = await getTransactionById(transaction_id, myId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    if (transaction.status !== "draft") {
      return res.status(400).json({ error: "Transaksi bukan status draft" });
    }

    const userResult = await findUserByEmail(email);
    if (!userResult.rows.length) {
      return res
        .status(404)
        .json({ error: "Email lawan transaksi tidak ditemukan" });
    }
    const otherUser = userResult.rows[0];

    let buyer_id = transaction.buyer_id;
    let seller_id = transaction.seller_id;
    if (!buyer_id)
      buyer_id = transaction.roles === "pembeli" ? myId : otherUser.id;
    if (!seller_id)
      seller_id = transaction.roles === "penjual" ? myId : otherUser.id;

    if (Number(otherUser.id) === Number(myId)) {
      return res.status(400).json({
        error: "Pembeli dan penjual tidak boleh menggunakan akun yang sama",
      });
    }

    // SECURITY FIX: Add final invariant check AFTER role-based assignment
    if (buyer_id && seller_id && Number(buyer_id) === Number(seller_id)) {
      return res.status(400).json({
        error: "Pembeli dan penjual tidak boleh menggunakan akun yang sama",
      });
    }

    await attachParticipantsAndActivate(transaction, buyer_id, seller_id, myId);

    try {
      if (buyer_id) {
        await createAndSendNotification({
          user_id: buyer_id,
          title: "Transaksi Siap Dibayar",
          message: `Transaksi ${transaction.kode_transaksi} telah diupdate dan siap untuk pembayaran. Silakan lakukan pembayaran sesuai instruksi.`,
          type: "transaction",
          data: {
            transaction_id,
            kode_transaksi: transaction.kode_transaksi,
            status: "wait_payment",
            amount: transaction.amount_paid,
            action: "ready_for_payment",
          },
        });
      }

      if (seller_id) {
        await createAndSendNotification({
          user_id: seller_id,
          title: "Transaksi Menunggu Pembayaran",
          message: `Transaksi ${transaction.kode_transaksi} telah diupdate dan menunggu pembayaran dari pembeli.`,
          type: "transaction",
          data: {
            transaction_id,
            kode_transaksi: transaction.kode_transaksi,
            status: "wait_payment",
            amount: transaction.amount_paid,
            action: "waiting_buyer_payment",
          },
        });
      }
    } catch (notifError) {
      console.error(
        "Error sending update to wait_payment notifications:",
        notifError,
      );
    }

    const buyerUser = await findUserById(buyer_id);
    const sellerUser = await findUserById(seller_id);

    if (buyerUser.rows.length) {
      const buyerEmail = buyerUser.rows[0].email;
      const buyerName = buyerUser.rows[0].name;
      sendEmail(
        buyerEmail,
        `Informasi Transaksi ${transaction.kode_transaksi}`,
        `
        <p>Halo ${buyerName},</p>
        <p>Transaksi dengan ID <b>${transaction.kode_transaksi}</b> telah diupdate dan siap untuk pembayaran.</p>
        <p>Silakan lakukan pembayaran sesuai dengan instruksi yang diberikan.</p>
        <p>Terima kasih atas kepercayaan Anda menggunakan layanan kami.</p>
        <a href="https://www.rekber.com/dashboard/transactions/${transaction_id}">Lihat Detail Transaksi</a>
      `,
      );
    }

    if (sellerUser.rows.length) {
      const sellerEmail = sellerUser.rows[0].email;
      const sellerName = sellerUser.rows[0].name;
      sendEmail(
        sellerEmail,
        `Informasi Transaksi ${transaction.kode_transaksi}`,
        `
        <p>Halo ${sellerName},</p>
        <p>Transaksi dengan ID <b>${transaction.kode_transaksi}</b> telah diupdate dan menunggu pembayaran dari pembeli.</p>
        <p>Silakan tunggu konfirmasi pembayaran dari sistem kami.</p>
        <p>Terima kasih atas kepercayaan Anda menggunakan layanan kami.</p>
        <a href="https://www.rekber.com/dashboard/transactions/${transaction_id}">Lihat Detail Transaksi</a>
      `,
      );
    }

    return res.status(200).json({
      message: "Transaksi berhasil diupdate ke waiting payment",
      transaction_id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Placeholder stub functions for remaining controllers
async function getTransactionsController(req, res) {
  try {
    const userId = req.user.id;
    const transactions = await getTransactionsByUserIdAll(userId);

    // Filter partnership data for buyer
    const filteredTransactions = transactions.map(t => {
      if (t.buyer_id === userId) {
        const { partnership_percentage, fee_partnership, ...rest } = t;
        return rest;
      }
      return t;
    });

    return res.status(200).json({
      success: true,
      transactions: filteredTransactions,
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get transactions",
    });
  }
}


async function getDetailTransactionController(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const myId = req.user.id;

    // Ambil data transaksi
    const transaction = await getTransactionById(transactionId, userId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan"});
    }

    // Pastikan user terkait dengan transaksi ini
    if (transaction.status !== "draft" && transaction.buyer_id !== myId && transaction.seller_id !== myId && transaction.created_by !== myId) {
      return res.status(403).json({ error: "Tidak memiliki akses ke transaksi ini" });
    }

    // Check if transaction has been reported by current user
    const reportCheck = await pool.query(`
      SELECT COUNT(*) as report_count
      FROM reports 
      WHERE transaction_id = $1 AND reported_by = $2
    `, [transactionId, myId]);

    const hasReported = parseInt(reportCheck.rows[0].report_count) > 0;

    // Ambil log status transaksi
    const logs = await getTransactionStatusLogsById(transactionId);

    // Filter partnership data for buyer
    if (transaction.buyer_id === myId) {
      delete transaction.is_partnership;
      delete transaction.partnership_percentage;
      delete transaction.fee_partnership;
    }

    return res.json({
      transaction: {
        ...transaction,
        is_reports: hasReported
      },
      status_logs: logs
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function cancelTransactionController(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // Ambil data transaksi
    const transaction = await getTransactionById(transactionId, userId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    // Hanya buyer, seller, atau creator yang boleh membatalkan
    if (transaction.buyer_id !== userId && transaction.seller_id !== userId && transaction.created_by !== userId) {
      return res.status(403).json({ error: "Tidak memiliki akses membatalkan transaksi ini" });
    }

    // Hanya transaksi yang belum selesai/belum dibatalkan yang bisa dibatalkan
    if (transaction.status === "cancel" || transaction.status === "done") {
      return res.status(400).json({ error: "Transaksi sudah selesai atau sudah dibatalkan" });
    }

    // Update status transaksi ke cancel
    await pool.query(
      "UPDATE transactions SET status = 'cancel' WHERE id = $1",
      [transactionId]
    );

    // Log status transaksi
    await createTransactionStatusLog({
      transaction_id: transactionId,
      status: "cancel",
      name: "Transaksi dibatalkan",
      update_by: userId,
      note: `Transaksi TRS-${transactionId.toString().padStart(3, "0")} dibatalkan oleh user ID ${userId}`,
    });

    // SEND NOTIFICATIONS FOR CANCEL TRANSACTION
    try {
      // Notifikasi ke BUYER (jika bukan yang membatalkan)
      if (transaction.buyer_id && transaction.buyer_id !== userId) {
        await createAndSendNotification({
          user_id: transaction.buyer_id,
          title: "Transaksi Dibatalkan",
          message: `Transaksi ${transaction.kode_transaksi} telah dibatalkan. Jika ada pembayaran yang sudah dilakukan, akan diproses refund.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "cancel",
            action: "transaction_cancelled"
          }
        });
      }

      // Notifikasi ke SELLER (jika bukan yang membatalkan)
      if (transaction.seller_id && transaction.seller_id !== userId) {
        await createAndSendNotification({
          user_id: transaction.seller_id,
          title: "Transaksi Dibatalkan",
          message: `Transaksi ${transaction.kode_transaksi} telah dibatalkan. Transaksi tidak dapat dilanjutkan.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "cancel",
            action: "transaction_cancelled"
          }
        });
      }

      // Notifikasi ke yang membatalkan
      await createAndSendNotification({
        user_id: userId,
        title: "Transaksi Berhasil Dibatalkan",
        message: `Transaksi ${transaction.kode_transaksi} berhasil dibatalkan.`,
        type: "transaction",
        data: {
          transaction_id: transactionId,
          kode_transaksi: transaction.kode_transaksi,
          status: "cancel",
          action: "cancel_confirmed"
        }
      });

    } catch (notifError) {
      console.error('Error sending cancel notifications:', notifError);
    }

    return res.status(200).json({ message: "Transaksi berhasil dibatalkan" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createVAController(req, res) {
  try {
    const { refid, channel, amount, desc } = req.body;

    // Validate required fields
    if (!refid || !channel || !amount) {
      return res.status(400).json({ 
        error: "refid, channel, dan amount wajib diisi" 
      });
    }

    // Validate transaction exists by kode_transaksi
    const transactionQuery = await pool.query(
      "SELECT id, kode_transaksi FROM transactions WHERE kode_transaksi = $1",
      [refid]
    );

    if (transactionQuery.rows.length === 0) {
      return res.status(404).json({ 
        error: "Transaksi tidak ditemukan dengan kode transaksi tersebut" 
      });
    }

    // Check if active VA already exists
    const existingVA = await findVAByRefidAndChannel(refid, channel);
    if (existingVA) { 
      const responseData = {
        amount: existingVA.amount,
        expired_at: existingVA.expired_at,
        channel: existingVA.channel,
        refid: existingVA.refid,
        trxid: existingVA.trxid
      };

      // Add specific fields based on channel type
      if (channel.toUpperCase() === 'QRIS') {
        responseData.qr_code = existingVA.qr_string;
      } else {
        responseData.va_number = existingVA.va_number;
      }

      return res.status(200).json({
        message: "Using existing Virtual Account/QRIS",
        data: responseData
      });
    }

    const API_KEY = "a14934d87baa20d04fa589c31ce8cb066706296e949bad73e12dabab37d7d008";
    const PARTNER_ID = "ab1bdeed-edd6-4565-8006-cc151bcbe2c7";

    // Set expiry date 24 hours from now
    const exp_date = new Date();
    exp_date.setHours(exp_date.getHours() + 24);

    // Format dates with Jakarta timezone (+07:00)
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6+07:00');

    const formattedExpDate = exp_date.toLocaleString('en-US', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6+07:00');

    let apiUrl, requestBody;

    // Check if channel is QRIS
    if (channel.toUpperCase() === 'QRIS') {
      // QRIS API endpoint
      apiUrl = 'https://gateway.ceklaporan.com/api/qr/generate';
      requestBody = {
        partner_id: PARTNER_ID,
        refid,
        amount: Number(amount),
        exp_date: formattedExpDate,
        is_static: false
      };
    } else {
      // VA API endpoint
      apiUrl = 'https://gateway.ceklaporan.com/api/va/create';
      requestBody = {
        partner_id: PARTNER_ID,
        refid,
        channel,
        amount: Number(amount),
        desc: desc || `Payment ${refid}`,
        exp_date: formattedExpDate
      };
    }

    const minifiedBody = JSON.stringify(requestBody);

    // Generate signature (minified body + timestamp)
    const dataToSign = minifiedBody + timestamp;
    const signature = crypto
      .createHmac('sha256', API_KEY)
      .update(dataToSign)
      .digest('hex');

    // Call API (VA or QRIS)
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'X-signature': signature,
        'X-Timestamp': timestamp
      },
      body: minifiedBody
    });

    const responseData = await apiResponse.json();
    
    if (!apiResponse.ok) {
      console.error('API Provider Error:', responseData);
      return res.status(apiResponse.status).json({ 
        error: `Failed to create ${channel.toUpperCase() === 'QRIS' ? 'QRIS' : 'Virtual Account'}`,
        details: responseData
      });
    }

    // Save to database
    const savedPayment = await createVirtualAccount({
      refid,
      trxid: responseData.data?.trxid || responseData.trxid,
      channel,
      va_number: responseData.data?.va_number || null,
      qr_string: responseData.data?.qr_code || null, // Store qr_code as qr_string
      amount: Number(amount),
      description: desc || `Payment ${refid}`,
      expired_at: exp_date,
      provider_response: responseData
    });

    console.log('Payment method saved to database:', savedPayment);

    // Prepare response data
    const finalResponseData = {
      trxid: savedPayment.trxid,
      refid: savedPayment.refid,
      amount: savedPayment.amount,
      exp_date: savedPayment.expired_at,
      channel: savedPayment.channel
    };

    // Add specific fields based on payment method
    if (channel.toUpperCase() === 'QRIS') {
      finalResponseData.qr_code = savedPayment.qr_string; // Return as qr_code
    } else {
      finalResponseData.va_number = savedPayment.va_number;
    }

    return res.status(200).json({
      status: true,
      message: `Success create ${channel.toUpperCase() === 'QRIS' ? 'QRIS' : 'VA'}`,
      data: finalResponseData
    });

  } catch (err) {
    console.error('Create Payment Error:', err);
    return res.status(500).json({ 
      status: false,
      message: "Internal server error",
      error: err.message 
    });
  }
}

async function completeTransactionController(req, res) {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const transaction = await getTransactionById(transactionId, userId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    if (transaction.buyer_id !== userId) {
      return res
        .status(403)
        .json({ error: "Hanya pembeli yang dapat menyelesaikan transaksi" });
    }

    if (transaction.status !== "paid") {
      return res
        .status(400)
        .json({ error: "Transaksi belum dibayar atau sudah selesai" });
    }

    const releaseDate = calculateNextWorkingDay(new Date());

    await pool.query(
      `UPDATE transactions 
       SET status = 'completed',
           completed_at = NOW(),
           release_date = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [releaseDate, transactionId],
    );

    await createTransactionStatusLog({
      transaction_id: transactionId,
      status: "completed",
      name: "Transaksi selesai",
      update_by: userId,
      note: `Transaksi ${transaction.kode_transaksi} telah diselesaikan. Dana akan dilepaskan pada(H+1 - H+2 hari kerja)`,
    });

    try {
      await createAndSendNotification({
        user_id: userId,
        title: "Transaksi Selesai",
        message: `Transaksi ${transaction.kode_transaksi} berhasil diselesaikan. Terima kasih atas kepercayaan Anda menggunakan layanan kami.`,
        type: "transaction",
        data: {
          transaction_id: transactionId,
          kode_transaksi: transaction.kode_transaksi,
          status: "completed",
          release_date: releaseDate,
          action: "transaction_completed",
        },
      });

      if (transaction.seller_id) {
        await createAndSendNotification({
          user_id: transaction.seller_id,
          title: "Transaksi Selesai",
          message: `Transaksi ${transaction.kode_transaksi} telah diselesaikan oleh pembeli. Dana akan dilepaskan pada H+1 - H+2 hari kerja.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "completed",
            release_date: releaseDate,
            amount: transaction.total_amount,
            action: "ready_for_disbursement",
          },
        });
      }
    } catch (notifError) {
      console.error("Error sending completion notifications:", notifError);
    }

    const sellerUser = await findUserById(transaction.seller_id);
    if (sellerUser.rows.length) {
      const sellerEmail = sellerUser.rows[0].email;
      const sellerName = sellerUser.rows[0].name;
      sendEmail(
        sellerEmail,
        `Transaksi ${transaction.kode_transaksi} Selesai`,
        `
        <p>Halo ${sellerName},</p>
        <p>Transaksi dengan ID <b>${transaction.kode_transaksi}</b> telah diselesaikan oleh pembeli.</p>
        <p>Dana akan dilepaskan pada (H+1 - H+2 hari kerja).</p>
        <a href="https://www.rekber.com/dashboard/transactions/${transactionId}">Lihat Detail Transaksi</a>
      `,
      );
    }

    const adminEmails = await getAdminEmails();
    if (adminEmails.length) {
      const adminHtml = `
        <p>Transaksi <b>${transaction.kode_transaksi}</b> telah diselesaikan oleh pembeli.</p>
        <p>Silakan proses pencairan dana ke seller <b>${sellerUser.rows[0]?.name || "-"}</b> pada (H+1 - H+2 hari kerja).</p>
        <ul>
          <li>Nominal: <b>Rp${parseInt(transaction.total_amount).toLocaleString("id-ID")}</b></li> 
        </ul>
        <a href="https://admin.rekber.com/transactions/${transactionId}">Admin Panel</a>
      `;
      for (const adminEmail of adminEmails) {
        sendEmail(
          adminEmail,
          `[ACTION] Transaksi ${transaction.kode_transaksi} Selesai - Proses Pencairan`,
          adminHtml,
        );
      }
    }
    return res.status(200).json({
      message: "Transaksi berhasil diselesaikan",
      release_date: releaseDate,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function applyVoucherToTransactionController(req, res) {
  try {
    const { voucher_code, total_amount } = req.body;

    if (!voucher_code || !total_amount) {
      return res.status(400).json({
        status: false,
        error: "voucher_code dan total_amount wajib diisi",
      });
    }

    const voucherResult = await pool.query(
      `
      SELECT * FROM vouchers WHERE code = $1 AND is_active = true
    `,
      [voucher_code.toUpperCase()],
    );

    if (voucherResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Kode voucher tidak valid atau sudah tidak aktif",
      });
    }

    const voucher = voucherResult.rows[0];

    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        status: false,
        error: "Voucher sudah mencapai batas penggunaan",
      });
    }

    const discountAmount = parseFloat(voucher.value);

    if (discountAmount > total_amount) {
      return res.status(400).json({
        status: false,
        error: "Diskon voucher tidak boleh lebih besar dari total transaksi",
      });
    }

    const finalAmount = total_amount - discountAmount;

    return res.status(200).json({
      status: true,
      message: "Voucher valid dan dapat digunakan",
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        discount_amount: discountAmount,
        original_amount: total_amount,
        final_amount: finalAmount,
        remaining_usage: voucher.usage_limit - voucher.used_count,
      },
    });
  } catch (err) {
    console.error("Apply voucher error:", err);
    return res.status(500).json({
      status: false,
      error: "Internal server error",
    });
  }
}

const getAllTransactionsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        buyer.name as buyer_name,
        seller.name as seller_name,
        t.is_partnership as is_partnership,
        t.partnership_percentage as partnership_percentage
      FROM transactions t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting all transactions (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

const getUnpaidTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM transactions 
      WHERE status = 'unpaid' 
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting unpaid transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unpaid transactions'
    });
  }
};

module.exports = {
  createTransactionController,
  getTransactionsController,
  getDetailTransactionController,
  updateTransactionToWaitingPaymentController,
  cancelTransactionController,
  completeTransactionController,
  createVAController,
  applyVoucherToTransactionController,
  getAllTransactionsAdmin,
  getUnpaidTransactions,
};
