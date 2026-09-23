// controllers/dashboardController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { sendEmail } = require('../utils/email'); // Tambahkan import ini

// Import notification helper
const { createAndSendNotification } = require('../utils/notificationHelper');
const { createPaymentCallback, updateCallbackStatus } = require('../models/paymentCallbackModel');
const { updateTransactionStatus, createTransactionStatusLog } = require('../models/transactionsModel');
const { encryptId, decryptId } = require('../utils/idCipher');

async function getDashboardStats(req, res) {
  try {
    // Get total transactions
    const totalTransactionsQuery = await pool.query(
      "SELECT COUNT(*) as total FROM transactions WHERE status != 'draft'"
    );
    const totalTransactions = parseInt(totalTransactionsQuery.rows[0].total);

    // Get active users (users who have made transactions)
    const activeUsersQuery = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u 
      INNER JOIN transactions t ON (u.id = t.buyer_id OR u.id = t.seller_id)
      WHERE t.status != 'draft'
    `);
    const activeUsers = parseInt(activeUsersQuery.rows[0].total);

    // Get paid transactions
    const paidTransactionsQuery = await pool.query(
      "SELECT COUNT(*) as total FROM transactions WHERE status = 'paid' OR status = 'completed'"
    );
    const paidTransactions = parseInt(paidTransactionsQuery.rows[0].total);

    // Get total amount of incoming payments
    const totalAmountQuery = await pool.query(`
      SELECT COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total 
      FROM transactions 
      WHERE status IN ('paid', 'completed', 'done')
    `);
    const totalAmount = parseFloat(totalAmountQuery.rows[0].total);

    // Get recent transactions
    const recentTransactionsQuery = await pool.query(`
      SELECT 
        t.id,
        t.kode_transaksi,
        t.notes,
        t.total_amount,
        t.status,
        t.created_at,
        buyer.name as buyer_name,
        seller.name as seller_name
      FROM transactions t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      WHERE t.status != 'draft'
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    return res.status(200).json({
      status: true,
      message: "Dashboard stats retrieved successfully",
      data: {
        summary: {
          total_transactions: totalTransactions,
          active_users: activeUsers,
          paid_transactions: paidTransactions,
          total_amount: totalAmount
        },
        recent_transactions: recentTransactionsQuery.rows
      }
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

const getCategoryName = (categId) => {
  switch(parseInt(categId)) {
    case 1: return 'Fisik';
    case 2: return 'Digital';
    case 3: return 'Jasa';
    default: return 'Fisik';
  }
};

 // GET - Transactions List 
async function getTransactionsList(req, res) {
  try {
    const { page = 1, limit = 20, status, search, category, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE t.status != ''";
    let queryParams = [];
    let paramCount = 0;

    // Filter by status
    if (status && status !== 'Semua Status') {
      paramCount++;
      whereClause += ` AND t.status = $${paramCount}`;
      queryParams.push(status.toLowerCase());
    }

    // Filter by category  
    if (category && category !== 'Semua Kategori') {
      paramCount++;
      whereClause += ` AND t.categ_id = $${paramCount}`;
      queryParams.push(category.toLowerCase());
    }

    // Filter by date range
    if (start_date) {
      paramCount++;
      whereClause += ` AND DATE(t.created_at) >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      whereClause += ` AND DATE(t.created_at) <= $${paramCount}`;
      queryParams.push(end_date);
    }

    // Search functionality
    if (search) {
      paramCount++;
      whereClause += ` AND (t.kode_transaksi ILIKE $${paramCount} OR t.notes ILIKE $${paramCount} OR buyer.name ILIKE $${paramCount} OR seller.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      ${whereClause}
    `;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Get transactions with pagination
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const transactionsQuery = `
      SELECT 
        t.id,
        t.kode_transaksi,
        t.notes,
        t.amount_paid,
        t.total_amount,
        t.status,
        t.categ_id,
        t.created_at,
        buyer.name as buyer_name,
        seller.name as seller_name,
        t.is_partnership as is_partnership,
        t.partnership_percentage as partnership_percentage
      FROM transactions t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(limit, offset);
    const transactionsResult = await pool.query(transactionsQuery, queryParams);

    // Format transactions sesuai UI dashboard
    const formattedTransactions = transactionsResult.rows.map(transaction => ({
      id: encryptId(transaction.id),
      kode_transaksi: transaction.kode_transaksi,
      pembeli: transaction.buyer_name,
      penjual: transaction.seller_name,
      jumlah: `Rp ${parseFloat(transaction.amount_paid).toLocaleString('id-ID')}`,
      status: transaction.status,
      kategori: getCategoryName(transaction.categ_id),
      tanggal: new Date(transaction.created_at).toLocaleDateString('id-ID'),
      is_partnership: transaction.is_partnership || false,
      partnership_percentage: transaction.partnership_percentage ? parseFloat(transaction.partnership_percentage) : 0
    }));

    return res.status(200).json({
      status: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions: formattedTransactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit),
          showing: `Menampilkan ${formattedTransactions.length} dari ${total} transaksi`
        }
      }
    });

  } catch (err) {
    console.error('Get transactions list error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

async function getDetailTransactionAdminController(req, res) {
  try {
    let transactionId;
    try {
      transactionId = decryptId(req.params.id);
    } catch (err) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }
    const myId = req.user.id;

    const result = await pool.query(
      `SELECT t.*,
              buyer.name AS buyer_name,
              buyer.email AS buyer_email,
              buyer.is_verified AS buyer_is_verified,
              seller.name AS seller_name,
              seller.email AS seller_email,
              seller.is_verified AS seller_is_verified,
              t.is_partnership AS is_partnership,
              t.partnership_percentage AS partnership_percentage
       FROM transactions t
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       WHERE t.id = $1`,
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan" });
    }

    const transaction = result.rows[0];

    // Ambil info rekening penjual (untuk disbursed)
    const sellerBankQuery = await pool.query(
      `SELECT no_rek, nama_rekening, bank
       FROM user_detail 
       WHERE user_id = $1`,
      [transaction.seller_id]
    );

    // Ambil info rekening pembeli (untuk refund)
    const buyerBankQuery = await pool.query(
      `SELECT no_rek, nama_rekening, bank
       FROM user_detail 
       WHERE user_id = $1`,
      [transaction.buyer_id]
    );

    const sellerBank = sellerBankQuery.rows[0] || {};
    const buyerBank = buyerBankQuery.rows[0] || {};
 
    // Ambil log status transaksi 
    const logs = await pool.query(
      `SELECT * 
      FROM transaction_status_logs 
      WHERE transaction_id = $1
      ORDER BY created_at ASC`,
      [transactionId]
    );

    const formattedLogs = logs.rows.map(log => ({
      id: log.id,
      transaction_id: log.transaction_id,
      status: log.status,
      name: log.name,
      note: log.note || null,
      update_by: log.update_by || null,
      created_at: log.created_at,
      formatted_date: new Date(log.created_at).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    // Ambil data payment dari payment_callbacks berdasarkan reference_id (kode_transaksi)
    const paymentResult = await pool.query(
      `SELECT 
        id,
        transaction_id,
        external_id,
        payment_method,
        payment_gateway,
        status,
        amount,
        currency,
        fee,
        net_amount,
        reference_id,
        created_at,
        updated_at
       FROM payment_callbacks 
       WHERE transaction_id = $1 
       ORDER BY created_at DESC`,
      [transaction.kode_transaksi]
    );

    // Ambil bukti pengiriman
    const shippingProofResult = await pool.query(
      `SELECT 
        id,
        transaction_id,
        seller_id,
        image_url,
        description,
        uploaded_at
       FROM transaction_shipping 
       WHERE transaction_id = $1 
       ORDER BY uploaded_at DESC`,
      [transactionId]
    );

    // Ambil laporan terkait transaksi
    const reportsResult = await pool.query(
      `SELECT 
        r.id,
        r.transaction_id,
        r.reported_by,
        r.report_type,
        r.reason,
        r.description,
        r.evidence_files,
        r.status,
        r.admin_response,
        r.reviewed_by,
        r.created_at,
        u.name as reporter_name
      FROM reports r
      LEFT JOIN users u ON r.reported_by = u.id
      WHERE r.transaction_id = $1 
      ORDER BY r.created_at DESC`,
      [transactionId]
    );


    // Format payment data
    const payments = paymentResult.rows[0];

    // Format shipping proofs
    const shippingProofs = shippingProofResult.rows.map(proof => ({
      id: proof.id,
      seller_id: proof.seller_id,
      image_url: proof.image_url,
      description: proof.description || '-',
      uploaded_at: proof.uploaded_at,
      formatted_date: new Date(proof.uploaded_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
 // Format reports - Perbaikan
const reports = reportsResult.rows.map(report => {
  // Parse evidence_files dengan pengecekan tipe data
  let evidenceUrl = null;
  if (report.evidence_files) {
    try {
      // Cek apakah sudah berupa object/array atau masih string JSON
      let evidenceArray = report.evidence_files;
      
      if (typeof evidenceArray === 'string') {
        evidenceArray = JSON.parse(evidenceArray);
      }
      
      if (Array.isArray(evidenceArray) && evidenceArray.length > 0) {
        evidenceUrl = evidenceArray[0].url || evidenceArray[0].secure_url;
      }
    } catch (e) {
      console.log('Parse evidence_files error:', e);
      // Jika parsing gagal, coba ambil langsung sebagai string
      evidenceUrl = report.evidence_files;
    }
  }

  return {
    id: report.id,
    reported_by: report.reported_by,
    reporter_name: report.reporter_name,
    report_type: report.report_type,
    reason: report.reason,
    description: report.description,
    evidence_url: evidenceUrl,
    status: report.status,
    admin_response: report.admin_response,
    reviewed_by: report.reviewed_by,
    created_at: report.created_at,
    formatted_date: new Date(report.created_at).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
});
    // Info rekening berdasarkan status transaksi
    let bankInfo = {};
    if (transaction.status != 'refunded') {
      bankInfo = {
        type: 'seller',
        purpose: 'Pencairan Dana',
        recipient: transaction.seller_name,
        bank: sellerBank.bank || '-',
        no_rekening: sellerBank.no_rek || '-',
        nama_rekening: sellerBank.nama_rekening || '-'
      };
    } else { 
      bankInfo = {
        type: 'buyer',
        purpose: 'Refund Dana',
        recipient: transaction.buyer_name,
        bank: buyerBank.bank || '-',
        no_rekening: buyerBank.no_rek || '-',
        nama_rekening: buyerBank.nama_rekening || '-'
      };
    }

    return res.json({
      transaction: {
        ...transaction,
        total_amount: parseFloat(transaction.total_amount),
        amount_paid: parseFloat(transaction.amount_paid),
        fee_amount: parseFloat(transaction.fee_amount || 0)
      },
      status_logs: formattedLogs,
      payments: payments,
      shipping_proofs: shippingProofs,
      reports: reports,
      bank_info: bankInfo
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
 
// POST - Disbursed Transaction (Admin only)
async function disbursedTransactionController(req, res) {
  try {
    const transactionId = req.params.id;
    const adminId = req.user.id;
    const { note } = req.body;

    // Ambil data transaksi dengan detail buyer dan seller
    const result = await pool.query(
      `SELECT t.*, 
              buyer.name AS buyer_name, 
              buyer.email AS buyer_email,
              seller.name AS seller_name,
              seller.email AS seller_email
       FROM transactions t
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       WHERE t.id = $1`,
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: false,
        error: "Transaksi tidak ditemukan" 
      });
    }

    const transaction = result.rows[0];

    // Hanya transaksi yang sudah paid yang bisa di-disbursed
    if (transaction.status !== "completed") {
      return res.status(400).json({ 
        status: false,
        error: "Hanya transaksi yang sudah dibayar yang dapat di-disbursed" 
      });
    }

    // Update status transaksi ke disbursed
    await pool.query(
      "UPDATE transactions SET status = 'disbursed', updated_at = NOW() WHERE id = $1",
      [transactionId]
    );

    // Log status transaksi
    await pool.query(`
      INSERT INTO transaction_status_logs (transaction_id, status, name, update_by, note)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      transactionId,
      'disbursed',
      'Dana telah dicairkan',
      adminId,
      note || `Dana dari transaksi ${transaction.kode_transaksi} telah dicairkan oleh admin`
    ]);

    // SEND NOTIFICATIONS FOR DISBURSED TRANSACTION
    try {
      // Notifikasi ke BUYER
      if (transaction.buyer_id) {
        await createAndSendNotification({
          user_id: transaction.buyer_id,
          title: "Dana Telah Dicairkan",
          message: `Dana transaksi ${transaction.kode_transaksi} telah dicairkan kepada penjual. Transaksi telah selesai.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "disbursed",
            amount: transaction.total_amount,
            seller_name: transaction.seller_name,
            action: "funds_disbursed"
          }
        });
      }

      // Notifikasi ke SELLER
      if (transaction.seller_id) {
        await createAndSendNotification({
          user_id: transaction.seller_id,
          title: "Dana Berhasil Dicairkan",
          message: `Selamat! Dana dari transaksi ${transaction.kode_transaksi} sebesar Rp ${parseFloat(transaction.total_amount).toLocaleString('id-ID')} telah dicairkan ke rekening Anda.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "disbursed",
            amount: transaction.total_amount,
            buyer_name: transaction.buyer_name,
            action: "funds_received"
          }
        });
      }

    } catch (notifError) {
      console.error('Error sending disbursed notifications:', notifError);
    }

    // Kirim email ke buyer
    if (transaction.buyer_email && transaction.buyer_name) {
      const buyerSubject = `Dana Transaksi ${transaction.kode_transaksi} Telah Dicairkan`;
      const buyerHtml = `
        <p>Halo ${transaction.buyer_name},</p>
        <p>Dana dari transaksi berikut telah dicairkan kepada penjual:</p>
        <ul>
          <li><strong>Kode Transaksi:</strong> ${transaction.kode_transaksi}</li>
          <li><strong>Penjual:</strong> ${transaction.seller_name}</li>
          <li><strong>Jumlah:</strong> Rp ${parseFloat(transaction.total_amount).toLocaleString('id-ID')}</li>
          <li><strong>Tanggal Pencairan:</strong> ${new Date().toLocaleDateString('id-ID')}</li>
        </ul>
        <p>Transaksi ini telah selesai. Terima kasih telah menggunakan layanan kami.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      sendEmail(transaction.buyer_email, buyerSubject, buyerHtml);
    }

    // Kirim email ke seller
    if (transaction.seller_email && transaction.seller_name) {
      const sellerSubject = `Dana Transaksi ${transaction.kode_transaksi} Telah Dicairkan`;
      const sellerHtml = `
        <p>Halo ${transaction.seller_name},</p>
        <p>Selamat! Dana dari transaksi berikut telah dicairkan ke rekening Anda:</p>
        <ul>
          <li><strong>Kode Transaksi:</strong> ${transaction.kode_transaksi}</li>
          <li><strong>Pembeli:</strong> ${transaction.buyer_name}</li>
          <li><strong>Jumlah:</strong> Rp ${parseFloat(transaction.total_amount).toLocaleString('id-ID')}</li>
          <li><strong>Tanggal Pencairan:</strong> ${new Date().toLocaleDateString('id-ID')}</li>
        </ul>
        <p>Dana akan diterima dalam 1-3 hari kerja. Terima kasih telah menggunakan layanan kami.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      sendEmail(transaction.seller_email, sellerSubject, sellerHtml);
    }

    return res.status(200).json({ 
      status: true,
      message: "Dana berhasil dicairkan dan notifikasi telah dikirim",
      data: {
        transaction_id: transactionId,
        kode_transaksi: transaction.kode_transaksi,
        status: 'disbursed',
        disbursed_at: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('Disbursed transaction error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

// POST - Create Admin User
async function createAdminUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        error: "Name, email, dan password wajib diisi"
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: false,
        error: "Email sudah digunakan"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const newUser = await pool.query(`
      INSERT INTO users (name, email, password, is_admin, is_verified)
      VALUES ($1, $2, $3, true, true)
      RETURNING id, name, email, is_admin, created_at
    `, [name, email, hashedPassword]);

    return res.status(201).json({
      status: true,
      message: "Admin user berhasil dibuat",
      data: newUser.rows[0]
    });

  } catch (err) {
    console.error('Create admin user error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
} 
 

// GET - Users List dengan pagination dan data lengkap
async function getUsersList(req, res) {
  try {
    const { page = 1, limit = 20, search, is_partnership } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.phone ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    if (is_partnership === 'true') {
      whereClause += ` AND u.is_partnership = true`;
    } else if (is_partnership === 'false') {
      whereClause += ` AND u.is_partnership = false`;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Get users with pagination dan data lengkap
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const usersQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone, 
        u.status,
        u.created_on,
        u.is_partnership,
        u.partnership_percentage,
        u.partnership_expires_at,
        ud.no_rek,
        ud.nama_rekening,
        ud.bank
      FROM users u
      LEFT JOIN user_detail ud ON u.id = ud.user_id
      ${whereClause}
      ORDER BY u.created_on DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(limit, offset);
    const usersResult = await pool.query(usersQuery, queryParams);

    // Format data sesuai kebutuhan frontend
    const formattedUsers = usersResult.rows.map(user => ({
      id: user.id,
      nama: user.name || '-',
      email: user.email || '-',
      kontak: user.phone || '-',
      no_rekening: user.no_rek ? `${user.bank} - ${user.no_rek}` : '-',
      nama_rekening: user.nama_rekening || '-',
      bergabung: new Date(user.created_on).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      is_admin: user.is_admin || false,
      is_verified: user.is_verified || false,
      active: user.status || false,
      transaction_count: parseInt(user.transaction_count) || 0,
      is_partnership: user.is_partnership || false,
      partnership_percentage: user.partnership_percentage ? parseFloat(user.partnership_percentage) : 0,
      partnership_expires_at: user.partnership_expires_at || null
    }));

    return res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: {
        users: formattedUsers,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit),
          showing: `Menampilkan ${formattedUsers.length} dari ${total} pengguna`
        }
      }
    });

  } catch (err) {
    console.error('Get users list error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}
async function getUserDetail(req, res) {
  try {
    const userId = req.params.id;

    // Get user detail dengan alamat lengkap
    const userQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone, 
        u.created_on,
        u.is_partnership,
        u.partnership_percentage,
        u.partnership_expires_at,
        ud.alamat,
        ud.no_rek,
        ud.nama_rekening,
        ud.bank,
        ud.province_id,
        ud.regency_id,
        ud.district_id,
        ud.postal_code,
        p.name as province_name,
        r.name as regency_name,
        r.type as regency_type,
        d.name as district_name,
        (SELECT COUNT(*) FROM transactions WHERE buyer_id = u.id OR seller_id = u.id) as transaction_count
      FROM users u
      LEFT JOIN user_detail ud ON u.id = ud.user_id
      LEFT JOIN provinces p ON ud.province_id = p.id
      LEFT JOIN regencies r ON ud.regency_id = r.id
      LEFT JOIN districts d ON ud.district_id = d.id
      WHERE u.id = $1
    `;

    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "User tidak ditemukan"
      });
    }

    const user = userResult.rows[0];

    // Format alamat lengkap
    let alamatLengkap = '-';
    if (user.alamat || user.district_name || user.regency_name || user.province_name) {
      const alamatParts = [];
      
      if (user.alamat) alamatParts.push(user.alamat);
      if (user.district_name) alamatParts.push(`Kec. ${user.district_name}`);
      if (user.regency_name) {
        const regencyText = user.regency_type === 'KOTA' ? 'Kota' : 'Kab.';
        alamatParts.push(`${regencyText} ${user.regency_name}`);
      }
      if (user.province_name) alamatParts.push(user.province_name);
      if (user.postal_code) alamatParts.push(user.postal_code);
      
      alamatLengkap = alamatParts.join(', ');
    }
 
    // Format data user
    const formattedUser = {
      id: user.id,
      nama: user.name || '-',
      email: user.email || '-',
      kontak: user.phone || '-',
      alamat_lengkap: alamatLengkap,
      no_rekening: user.no_rek ? `${user.bank} - ${user.no_rek}` : '-',
      nama_rekening: user.nama_rekening || '-',
      bank: user.bank || '-',
      is_partnership: user.is_partnership || false,
      partnership_percentage: parseFloat(user.partnership_percentage || 0),
      partnership_expires_at: user.partnership_expires_at || null,
      bergabung: user.created_on ? new Date(user.created_on).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : '-',   
      alamat_detail: {
        alamat: user.alamat || '-',
        province: user.province_name || '-',
        regency: user.regency_name || '-',
        district: user.district_name || '-',
        postal_code: user.postal_code || '-'
      }
    };
 
    return res.status(200).json({
      status: true,
      message: "User detail retrieved successfully",
      data: {
        user: formattedUser
      }
    });

  } catch (err) {
    console.error('Get user detail error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

async function updateUserPartnershipController(req, res) {
  try {
    const userId = req.params.id;
    const { is_partnership, partnership_percentage, partnership_expires_at } = req.body;
    console.log(`[PARTNERSHIP UPDATE] Called for userId=${userId}, is_partnership=${is_partnership}, percentage=${partnership_percentage}, expires_at=${partnership_expires_at}`);

    const parsedPercentage = Math.min(100, Math.max(0, Number(partnership_percentage || 0)));
    const expiresAt = partnership_expires_at ? new Date(partnership_expires_at) : null;

    const updateQuery = `
      UPDATE users 
      SET is_partnership = $1, partnership_percentage = $2, partnership_expires_at = $3
      WHERE id = $4
      RETURNING id, is_partnership, partnership_percentage, partnership_expires_at
    `;
    const result = await pool.query(updateQuery, [!!is_partnership, parsedPercentage, expiresAt, userId]);

    if (result.rows.length === 0) {
      console.log(`[PARTNERSHIP UPDATE] User ${userId} not found`);
      return res.status(404).json({
        status: false,
        error: "User tidak ditemukan"
      });
    }

    console.log(`[PARTNERSHIP UPDATE] Successfully updated user ${userId}`);
    return res.status(200).json({
      status: true,
      message: "User partnership updated successfully",
      data: {
        id: result.rows[0].id,
        is_partnership: result.rows[0].is_partnership,
        partnership_percentage: parseFloat(result.rows[0].partnership_percentage),
        partnership_expires_at: result.rows[0].partnership_expires_at
      }
    });

  } catch (err) {
    console.error('[PARTNERSHIP UPDATE] Error occurred:', err);
    console.error('Update user partnership error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

async function refundTransactionController(req, res) {
  try {
    const transactionId = req.params.id;
    const adminId = req.user.id;
    const { note, refund_reason } = req.body;

    // Ambil data transaksi dengan detail buyer dan seller
    const result = await pool.query(
      `SELECT t.*, 
              buyer.name AS buyer_name, 
              buyer.email AS buyer_email,
              seller.name AS seller_name,
              seller.email AS seller_email
       FROM transactions t
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       WHERE t.id = $1`,
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: false,
        error: "Transaksi tidak ditemukan" 
      });
    }

    const transaction = result.rows[0];

    // Hanya transaksi yang sudah paid atau completed yang bisa di-refund
    if (!['paid', 'completed'].includes(transaction.status)) {
      return res.status(400).json({ 
        status: false,
        error: "Hanya transaksi yang sudah dibayar yang dapat di-refund" 
      });
    }

    // Update status transaksi ke refunded
    await pool.query(
      "UPDATE transactions SET status = 'refunded', updated_at = NOW() WHERE id = $1",
      [transactionId]
    );

    // Log status transaksi
    await pool.query(`
      INSERT INTO transaction_status_logs (transaction_id, status, name, update_by, note)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      transactionId,
      'refunded',
      'Dana telah direfund',
      adminId,
      note || `Dana dari transaksi ${transaction.kode_transaksi} telah direfund oleh admin.}`
    ]);

    // SEND NOTIFICATIONS FOR REFUNDED TRANSACTION
    try {
      // Notifikasi ke BUYER
      if (transaction.buyer_id) {
        await createAndSendNotification({
          user_id: transaction.buyer_id,
          title: "Dana Berhasil Direfund",
          message: `Dana transaksi ${transaction.kode_transaksi} sebesar Rp ${parseFloat(transaction.amount_paid).toLocaleString('id-ID')} telah direfund ke rekening Anda.`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "refunded",
            amount: transaction.amount_paid,
            refund_reason: refund_reason || 'Tidak disebutkan',
            action: "refund_received"
          }
        });
      }

      // Notifikasi ke SELLER
      if (transaction.seller_id) {
        await createAndSendNotification({
          user_id: transaction.seller_id,
          title: "Transaksi Direfund",
          message: `Transaksi ${transaction.kode_transaksi} telah direfund kepada pembeli. ${refund_reason ? 'Alasan: ' + refund_reason : ''}`,
          type: "transaction",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "refunded",
            amount: transaction.amount_paid,
            refund_reason: refund_reason || 'Tidak disebutkan',
            buyer_name: transaction.buyer_name,
            action: "transaction_refunded"
          }
        });
      }

    } catch (notifError) {
      console.error('Error sending refund notifications:', notifError);
    }

    // Kirim email ke buyer
    if (transaction.buyer_email && transaction.buyer_name) {
      const buyerSubject = `Dana Transaksi ${transaction.kode_transaksi} Telah Direfund`;
      const buyerHtml = `
        <p>Halo ${transaction.buyer_name},</p>
        <p>Dana dari transaksi berikut telah direfund ke rekening Anda:</p>
        <ul>
          <li><strong>Kode Transaksi:</strong> ${transaction.kode_transaksi}</li>
          <li><strong>Penjual:</strong> ${transaction.seller_name}</li>
          <li><strong>Jumlah Refund:</strong> Rp ${parseFloat(transaction.amount_paid).toLocaleString('id-ID')}</li> 
          <li><strong>Tanggal Refund:</strong> ${new Date().toLocaleDateString('id-ID')}</li>
        </ul>
        <p>Dana akan diterima dalam 1-3 hari kerja. Terima kasih telah menggunakan layanan kami.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      sendEmail(transaction.buyer_email, buyerSubject, buyerHtml);
    }

    // Kirim email ke seller
    if (transaction.seller_email && transaction.seller_name) {
      const sellerSubject = `Transaksi ${transaction.kode_transaksi} Telah Direfund`;
      const sellerHtml = `
        <p>Halo ${transaction.seller_name},</p>
        <p>Transaksi berikut telah direfund kepada pembeli:</p>
        <ul>
          <li><strong>Kode Transaksi:</strong> ${transaction.kode_transaksi}</li>
          <li><strong>Pembeli:</strong> ${transaction.buyer_name}</li>
          <li><strong>Jumlah Refund:</strong> Rp ${parseFloat(transaction.amount_paid).toLocaleString('id-ID')}</li>
          <li><strong>Alasan Refund:</strong> ${refund_reason || 'Tidak disebutkan'}</li>
          <li><strong>Tanggal Refund:</strong> ${new Date().toLocaleDateString('id-ID')}</li>
        </ul>
        <p>Jika Anda memiliki pertanyaan terkait refund ini, silakan hubungi customer service kami.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      sendEmail(transaction.seller_email, sellerSubject, sellerHtml);
    }

    return res.status(200).json({ 
      status: true,
      message: "Dana berhasil direfund dan notifikasi telah dikirim",
      data: {
        transaction_id: transactionId,
        kode_transaksi: transaction.kode_transaksi,
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: parseFloat(transaction.amount_paid),
        refund_reason: refund_reason || 'Tidak disebutkan'
      }
    });

  } catch (err) {
    console.error('Refund transaction error:', err);
    return res.status(500).json({ 
      status: false,
      error: "Internal server error" 
    });
  }
}

async function cancelTransactionAdminController(req, res) {
  try {
    const transactionId = req.params.id;
    const adminId = req.user.id;
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (result.rows.length === 0) return res.status(404).json({ status: false, error: "Transaksi tidak ditemukan" });
    await pool.query("UPDATE transactions SET status = 'cancel', updated_at = NOW() WHERE id = $1", [transactionId]);
    await pool.query("INSERT INTO transaction_status_logs (transaction_id, status, name, update_by, note) VALUES ($1, $2, $3, $4, $5)", [transactionId, 'cancel', 'Transaksi dibatalkan', adminId, `Transaksi dibatalkan oleh Admin`]);
    return res.status(200).json({ status: true, message: "Transaksi berhasil dibatalkan", transaction: {...result.rows[0], status: 'cancel'} });
  } catch (err) {
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function completeTransactionAdminController(req, res) {
  try {
    const transactionId = req.params.id;
    const adminId = req.user.id;
    const result = await pool.query('SELECT * FROM transactions WHERE id = $1', [transactionId]);
    if (result.rows.length === 0) return res.status(404).json({ status: false, error: "Transaksi tidak ditemukan" });
    await pool.query("UPDATE transactions SET status = 'completed', updated_at = NOW() WHERE id = $1", [transactionId]);
    await pool.query("INSERT INTO transaction_status_logs (transaction_id, status, name, update_by, note) VALUES ($1, $2, $3, $4, $5)", [transactionId, 'completed', 'Transaksi selesai', adminId, `Transaksi diselesaikan oleh Admin`]);
    return res.status(200).json({ status: true, message: "Transaksi berhasil diselesaikan", transaction: {...result.rows[0], status: 'completed'} });
  } catch (err) {
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function manualPaymentConfirmController(req, res) {
  try {
    const transactionId = req.params.id;
    const adminId = req.user.id;
    const { amount, note, payment_method, channel } = req.body;

    const result = await pool.query(
      `SELECT t.*,
              buyer.name AS buyer_name,
              buyer.email AS buyer_email,
              seller.name AS seller_name,
              seller.email AS seller_email
       FROM transactions t
       LEFT JOIN users buyer ON t.buyer_id = buyer.id
       LEFT JOIN users seller ON t.seller_id = seller.id
       WHERE t.id = $1`,
      [transactionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Transaksi tidak ditemukan" });
    }

    const transaction = result.rows[0];

    const confirmedAmount = parseFloat(amount || transaction.total_amount || transaction.amount);
    const externalId = `admin_manual_${transactionId}_${Date.now()}`;

    const callbackData = {
      transaction_id: transactionId,
      payment_gateway: 'manual_admin',
      external_id: externalId,
      payment_method: payment_method || channel || 'manual',
      status: 'PAID',
      amount: confirmedAmount,
      currency: 'IDR',
      fee: 0,
      net_amount: confirmedAmount,
      reference_id: transaction.kode_transaksi,
      payment_channel: channel || 'manual',
      bank_code: channel || null,
      va_number: null,
      qr_string: null,
      ewallet_type: null,
      raw_data: { confirmed_by_admin: adminId, note, original_body: req.body },
      signature: null,
      is_verified: true
    };

    const savedCallback = await createPaymentCallback(callbackData);
    await updateTransactionStatus(transactionId, 'paid');
    await updateCallbackStatus(savedCallback.id, 'PROCESSED', new Date());

    await createTransactionStatusLog({
      transaction_id: transactionId,
      status: 'paid',
      name: 'Sudah Dibayar',
      update_by: adminId,
      note: note || `Pembayaran transaksi ${transaction.kode_transaksi} dikonfirmasi manual oleh admin`
    });

    await createTransactionStatusLog({
      transaction_id: transactionId,
      status: 'waiting_confirmation',
      name: 'Menunggu Pengiriman Barang',
      update_by: adminId,
      note: `Menunggu konfirmasi barang dan penyelesaian transaksi pembeli.`
    });

    try {
      if (transaction.buyer_id) {
        await createAndSendNotification({
          user_id: transaction.buyer_id,
          title: "Pembayaran Dikonfirmasi",
          message: `Pembayaran untuk transaksi ${transaction.kode_transaksi} telah dikonfirmasi oleh admin. Silakan tunggu seller mengirimkan barang/jasa.`,
          type: "payment",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "paid",
            amount: confirmedAmount,
            payment_method: payment_method || 'manual',
            action: "manual_payment_confirmed"
          }
        });
      }

      if (transaction.seller_id) {
        await createAndSendNotification({
          user_id: transaction.seller_id,
          title: "Pembayaran Diterima",
          message: `Pembayaran untuk transaksi ${transaction.kode_transaksi} telah dikonfirmasi. Silakan segera kirimkan barang/jasa kepada pembeli.`,
          type: "payment",
          data: {
            transaction_id: transactionId,
            kode_transaksi: transaction.kode_transaksi,
            status: "paid",
            amount: confirmedAmount,
            payment_method: payment_method || 'manual',
            action: "manual_payment_received"
          }
        });
      }
    } catch (notifError) {
      console.error('Error sending manual payment notifications:', notifError);
    }

    if (transaction.buyer_email && transaction.buyer_name) {
      const buyerSubject = `Pembayaran Dikonfirmasi - ${transaction.kode_transaksi}`;
      const buyerHtml = `
        <p>Halo ${transaction.buyer_name},</p>
        <p>Pembayaran untuk transaksi <b>${transaction.kode_transaksi}</b> telah dikonfirmasi oleh admin.</p>
        <p>Jumlah: <b>Rp${confirmedAmount.toLocaleString('id-ID')}</b></p>
        <p>Tanggal Konfirmasi: <b>${new Date().toLocaleDateString('id-ID')}</b></p>
        <p>Silakan tunggu seller mengirimkan barang/jasa yang telah dibeli.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Lihat Detail Transaksi</a>
        </div>
      `;
      sendEmail(transaction.buyer_email, buyerSubject, buyerHtml);
    }

    if (transaction.seller_email && transaction.seller_name) {
      const sellerSubject = `Pembayaran Diterima - ${transaction.kode_transaksi}`;
      const sellerHtml = `
        <p>Halo ${transaction.seller_name},</p>
        <p>Pembayaran untuk transaksi <b>${transaction.kode_transaksi}</b> telah diterima dan dikonfirmasi.</p>
        <p>Jumlah: <b>Rp${confirmedAmount.toLocaleString('id-ID')}</b></p>
        <p>Tanggal Konfirmasi: <b>${new Date().toLocaleDateString('id-ID')}</b></p>
        <p>Silakan segera kirimkan barang/jasa kepada pembeli dan konfirmasi pengiriman melalui sistem.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/transactions/${transactionId}" class="button">Konfirmasi Pengiriman</a>
        </div>
      `;
      sendEmail(transaction.seller_email, sellerSubject, sellerHtml);
    }

    return res.status(200).json({
      status: true,
      message: "Pembayaran berhasil dikonfirmasi secara manual",
      data: {
        transaction_id: transactionId,
        kode_transaksi: transaction.kode_transaksi,
        amount: confirmedAmount,
        callback_id: savedCallback.id,
        confirmed_by: adminId
      }
    });

  } catch (err) {
    console.error('Manual payment confirm error:', err);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

module.exports = {
  getTransactionsList,
  getDetailTransactionAdminController,
  getUsersList,
  createAdminUser,
  disbursedTransactionController,
  getUserDetail,
  updateUserPartnershipController,
  refundTransactionController,
  getDashboardStats,
  cancelTransactionAdminController,
  completeTransactionAdminController,
  manualPaymentConfirmController
};