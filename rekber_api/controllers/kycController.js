const pool = require("../config/db");
const { sendEmail } = require("../utils/email");

function getFileUrl(file) {
  return file?.secure_url || file?.path || null;
}

async function submitKycController(req, res) {
  try {
    const userId = req.user.id;
    const { nik } = req.body;

    if (!nik || !/^\d{16}$/.test(nik)) {
      return res.status(400).json({ status: false, error: "NIK harus 16 digit angka" });
    }

    const ktpPhotoUrl = getFileUrl(req.files?.ktp_photo?.[0]);
    const selfieWithKtpUrl = getFileUrl(req.files?.selfie_with_ktp?.[0]);
    const selfieVideoUrl = getFileUrl(req.files?.selfie_video?.[0]);

    if (!ktpPhotoUrl || !selfieWithKtpUrl || !selfieVideoUrl) {
      return res.status(400).json({
        status: false,
        error: "Foto KTP, foto dengan KTP, dan video selfie wajah wajib diunggah",
      });
    }

    const existing = await pool.query(
      "SELECT status FROM kyc_verifications WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      const currentStatus = existing.rows[0].status;
      if (currentStatus === "approved") {
        return res.status(400).json({ status: false, error: "Identitas Anda sudah terverifikasi" });
      }
      if (currentStatus === "pending") {
        return res.status(400).json({ status: false, error: "Pengajuan Anda sedang diproses admin" });
      }
    }

    const result = await pool.query(
      `INSERT INTO kyc_verifications
        (user_id, nik, ktp_photo_url, selfie_with_ktp_url, selfie_video_url, status, rejection_reason, reviewed_by, reviewed_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NULL, NULL, NULL, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
        nik = EXCLUDED.nik,
        ktp_photo_url = EXCLUDED.ktp_photo_url,
        selfie_with_ktp_url = EXCLUDED.selfie_with_ktp_url,
        selfie_video_url = EXCLUDED.selfie_video_url,
        status = 'pending',
        rejection_reason = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL,
        updated_at = NOW()
       RETURNING *`,
      [userId, nik, ktpPhotoUrl, selfieWithKtpUrl, selfieVideoUrl]
    );

    return res.status(201).json({
      status: true,
      message: "Pengajuan verifikasi KYC berhasil dikirim",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function getMyKycController(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM kyc_verifications WHERE user_id = $1",
      [userId]
    );

    return res.status(200).json({
      status: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Error getting my KYC:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function getAllKycAdminController(req, res) {
  try {
    const { status } = req.query;

    const result = await pool.query(
      `SELECT k.*, u.name AS user_name, u.email AS user_email
       FROM kyc_verifications k
       JOIN users u ON u.id = k.user_id
       ${status ? "WHERE k.status = $1" : ""}
       ORDER BY k.created_at DESC`,
      status ? [status] : []
    );

    return res.status(200).json({ status: true, data: result.rows });
  } catch (error) {
    console.error("Error getting KYC list:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function getKycDetailAdminController(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT k.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM kyc_verifications k
       JOIN users u ON u.id = k.user_id
       WHERE k.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Pengajuan KYC tidak ditemukan" });
    }

    return res.status(200).json({ status: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error getting KYC detail:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function approveKycController(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE kyc_verifications
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Pengajuan KYC tidak ditemukan" });
    }

    const kyc = result.rows[0];
    await pool.query("UPDATE users SET is_verified = 1 WHERE id = $1", [kyc.user_id]);

    const userResult = await pool.query("SELECT name, email FROM users WHERE id = $1", [kyc.user_id]);
    const user = userResult.rows[0];
    if (user?.email) {
      const subject = "Verifikasi Identitas (KYC) Anda Disetujui";
      const html = `
        <p>Halo ${user.name},</p>
        <p>Selamat! Pengajuan verifikasi identitas (KYC) Anda telah <strong>disetujui</strong>.</p>
        <p>Akun Anda kini terverifikasi dan Anda dapat menggunakan seluruh fitur layanan Rekber.com.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/verifikasi" class="button">Lihat Status Verifikasi</a>
        </div>
        <p>Terima kasih telah melengkapi verifikasi identitas Anda.</p>
      `;
      sendEmail(user.email, subject, html).catch((err) => {
        console.error("Error sending KYC approval email:", err);
      });
    }

    return res.status(200).json({ status: true, message: "KYC berhasil diverifikasi", data: kyc });
  } catch (error) {
    console.error("Error approving KYC:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

async function rejectKycController(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ status: false, error: "Alasan penolakan wajib diisi" });
    }

    const result = await pool.query(
      `UPDATE kyc_verifications
       SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [reason.trim(), adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: false, error: "Pengajuan KYC tidak ditemukan" });
    }

    const kyc = result.rows[0];
    await pool.query("UPDATE users SET is_verified = 0 WHERE id = $1", [kyc.user_id]);

    const userResult = await pool.query("SELECT name, email FROM users WHERE id = $1", [kyc.user_id]);
    const user = userResult.rows[0];
    if (user?.email) {
      const subject = "Verifikasi Identitas (KYC) Anda Ditolak";
      const html = `
        <p>Halo ${user.name},</p>
        <p>Mohon maaf, pengajuan verifikasi identitas (KYC) Anda <strong>ditolak</strong> dengan alasan berikut:</p>
        <p style="padding: 12px; background-color: #fdecea; border-left: 4px solid #d32f2f; margin: 15px 0;">${kyc.rejection_reason}</p>
        <p>Silakan ajukan ulang verifikasi identitas Anda setelah melengkapi atau memperbaiki data sesuai catatan di atas.</p>
        <div class="button-container">
          <a href="https://www.rekber.com/dashboard/verifikasi" class="button">Ajukan Ulang Verifikasi</a>
        </div>
      `;
      sendEmail(user.email, subject, html).catch((err) => {
        console.error("Error sending KYC rejection email:", err);
      });
    }

    return res.status(200).json({ status: true, message: "KYC ditolak", data: kyc });
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    return res.status(500).json({ status: false, error: "Internal server error" });
  }
}

module.exports = {
  submitKycController,
  getMyKycController,
  getAllKycAdminController,
  getKycDetailAdminController,
  approveKycController,
  rejectKycController,
};
