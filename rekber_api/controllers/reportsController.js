const pool = require('../config/db');
const { sendEmail } = require('../utils/email');
const { deleteFile } = require('../config/cloudinary');

async function createReportController(req, res) {
  try {
    const userId = req.user.id;
    const { transaction_id, report_type, reason, description } = req.body;

    // Validation
    if (!transaction_id || !report_type || !reason) {
      return res.status(400).json({
        status: false,
        error: "transaction_id, report_type, dan reason wajib diisi"
      });
    }

    // Validate report_type
    const validReportTypes = ['transaction', 'chat', 'user', 'payment'];
    if (!validReportTypes.includes(report_type)) {
      return res.status(400).json({
        status: false,
        error: "report_type harus salah satu dari: transaction, chat, user, payment"
      });
    }

    // Check transaction access
    const transactionCheck = await pool.query(`
      SELECT t.*, 
             buyer.name as buyer_name, 
             buyer.email as buyer_email,
             seller.name as seller_name,
             seller.email as seller_email
      FROM transactions t
      LEFT JOIN users buyer ON t.buyer_id = buyer.id
      LEFT JOIN users seller ON t.seller_id = seller.id
      WHERE t.id = $1 AND (t.buyer_id = $2 OR t.seller_id = $2 OR t.created_by = $2)
    `, [transaction_id, userId]);

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Transaksi tidak ditemukan atau Anda tidak memiliki akses"
      });
    }

    const transaction = transactionCheck.rows[0];

    // Process uploaded files (dari Cloudinary)
    let evidenceFiles = [];
    if (req.files && req.files.length > 0) { 
      
      evidenceFiles = req.files.map(file => ({
        url: file.path, // Cloudinary URL
        secure_url: file.secure_url || file.path,
        public_id: file.public_id, // Cloudinary public_id
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        width: file.width || null,
        height: file.height || null,
        format: file.format || null,
        uploaded_at: new Date().toISOString()
      }));
        
    }


    // Save to database
    const newReport = await pool.query(`
      INSERT INTO reports (transaction_id, reported_by, report_type, reason, description, evidence_files, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [
      transaction_id,
      userId,
      report_type,
      reason,
      description || '',
      JSON.stringify(evidenceFiles)
    ]);

    const reportData = newReport.rows[0];

    // Get reporter info
    const reporterInfo = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    const reporter = reporterInfo.rows[0];

    // Send email notification to admin
    try {
      const adminEmails = await pool.query('SELECT email, name FROM users WHERE is_admin = 1');
      
      // Prepare evidence links for email
      let evidenceLinksHtml = '';
      if (evidenceFiles.length > 0) {
        evidenceLinksHtml = '<p><strong>Bukti yang dilampirkan:</strong></p><ul>';
        evidenceFiles.forEach((file) => {
          const fileSize = file.size ? (file.size / 1024).toFixed(1) : '0';
          evidenceLinksHtml += `<li><a href="${file.secure_url}" target="_blank">${file.originalname}</a> (${fileSize} KB)</li>`;
        });
        evidenceLinksHtml += '</ul>';
      }

      for (const admin of adminEmails.rows) {
        const adminSubject = `🚨 Laporan Baru - ${report_type.toUpperCase()}`;
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">🚨 Laporan Baru Diterima</h2>
            <p>Halo ${admin.name || 'Admin'},</p>
            <p>Ada laporan baru yang memerlukan perhatian segera:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detail Laporan:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>ID Laporan:</strong> #${reportData.id}</li>
                <li><strong>Tipe Laporan:</strong> <span style="background: #007bff; color: white; padding: 2px 8px; border-radius: 4px;">${report_type}</span></li>
                <li><strong>Kode Transaksi:</strong> ${transaction.kode_transaksi}</li>
                <li><strong>Pelapor:</strong> ${reporter.name} (${reporter.email})</li>
                <li><strong>Alasan:</strong> ${reason}</li>
                <li><strong>Deskripsi:</strong> ${description || 'Tidak ada deskripsi tambahan'}</li>
                <li><strong>Tanggal:</strong> ${new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
            </div>

            ${evidenceLinksHtml}

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://admin.rekber.com/reports/${reportData.id}" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                👁️ Review Laporan Sekarang
              </a>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Email otomatis dari sistem Rekber.com
            </p>
          </div>
        `;
        
        sendEmail(admin.email, adminSubject, adminHtml);
      }
    } catch (emailError) {
      console.error('Error sending email to admin:', emailError);
      // Jangan fail request jika email error
    }

    // Return response with proper JSON serialization
    return res.status(201).json({
      status: true,
      message: "Laporan berhasil dibuat dan dikirim ke admin",
      data: {
        report_id: reportData.id,
        transaction_id: Number(transaction_id),
        transaction_code: transaction.kode_transaksi || '',
        report_type: report_type,
        reason: reason,
        description: description || '',
        evidence_files: evidenceFiles.map(file => ({
          url: file.secure_url || '',
          filename: file.originalname || '',
          size: file.size || 0,
          mimetype: file.mimetype || ''
        })),
        status: 'pending',
        created_at: reportData.created_at
      }
    });

  } catch (err) {
    console.error('Create report error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

module.exports = {
  createReportController
};