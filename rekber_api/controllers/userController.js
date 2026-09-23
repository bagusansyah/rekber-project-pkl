const pool = require("../config/db"); 
const { findUserByEmail, findUserByNoHp, getUserDetailByUserId } = require("../models/userModel");

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, created_on FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function findUserByEmailOrPhone(identifier) {
  if (!identifier) return null;
  const byEmail = await findUserByEmail(identifier);
  if (byEmail && byEmail.rows && byEmail.rows.length) return byEmail.rows[0];
  const byPhone = await findUserByNoHp(identifier);
  if (byPhone && byPhone.rows && byPhone.rows.length) return byPhone.rows[0];
  return null;
}
async function searchUserByEmailOrPhoneController(req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' wajib diisi" });
    }

    const user = await findUserByEmailOrPhone(q);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    if (Number(user.id) === Number(req.user.id)) {
      return res.status(404).json({ error: "Tidak dapat berinteraksi dengan akun sendiri" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      avatar: user.avatar || null,
      is_verified: !!user.is_verified,
      is_partnership: user.is_partnership || false,
      partnership_percentage: parseFloat(user.partnership_percentage || 0),
      partnership_expires_at: user.partnership_expires_at || null
    };

    return res.status(200).json({ status: true, user: safeUser });
  } catch (err) {
    console.error('Search user error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getProfileDetail(req, res) {
  try {
    const userId = req.user.id;

    // Ambil data profil utama
    const userResult = await pool.query(
      "SELECT id, name, email, status, phone, created_on, is_partnership, partnership_percentage, partnership_expires_at FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const profile = userResult.rows[0];

    // Ambil detail dengan informasi wilayah
    const detailResult = await pool.query(`
      SELECT ud.*, 
             p.name as province_name,
             r.name as regency_name, r.type as regency_type,
             d.name as district_name
      FROM user_detail ud
      LEFT JOIN provinces p ON ud.province_id = p.id
      LEFT JOIN regencies r ON ud.regency_id = r.id
      LEFT JOIN districts d ON ud.district_id = d.id
      WHERE ud.user_id = $1
    `, [userId]);

    const detail = detailResult.rows[0] || null;

    return res.status(200).json({
      profile,
      detail
    });
  } catch (err) {
    console.error("Get profile detail error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateProfileDetail(req, res) {
  const userId = req.user.id;
  const {
    name, phone, alamat, no_rek, nama_rekening, bank,
    province_id, regency_id, district_id, postal_code
  } = req.body;

  try {
    // Update nama & nomor WhatsApp di tabel users
    if (name) {
      await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, userId]);
    }
    if (phone) {
      await pool.query("UPDATE users SET phone = $1 WHERE id = $2", [phone, userId]);
    }

    // Validasi wilayah
    if (province_id && regency_id) {
      const regencyCheck = await pool.query(
        "SELECT id FROM regencies WHERE id = $1 AND province_id = $2",
        [regency_id, province_id]
      );
      if (regencyCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: "Kabupaten/Kota tidak sesuai dengan provinsi yang dipilih" 
        });
      }
    }

    if (regency_id && district_id) {
      const districtCheck = await pool.query(
        "SELECT id FROM districts WHERE id = $1 AND regency_id = $2",
        [district_id, regency_id]
      );
      if (districtCheck.rows.length === 0) {
        return res.status(400).json({ 
          error: "Kecamatan tidak sesuai dengan kabupaten/kota yang dipilih" 
        });
      }
    }

    // Ambil detail user sekarang
    const currentDetail = await getUserDetailByUserId(userId);
    
    // Validasi bank tidak boleh kosong
    if (
      (bank !== undefined && (bank === "" || bank === null)) ||
      (no_rek !== undefined && (no_rek === "" || no_rek === null)) ||
      (nama_rekening !== undefined && (nama_rekening === "" || nama_rekening === null))
    ) {
      return res.status(400).json({ 
        error: "Bank, nomor rekening, dan nama rekening tidak boleh kosong." 
      });
    }

    // Validasi bank: jika sudah ada, tidak boleh diedit
    if (bank && currentDetail && currentDetail.bank) {
      return res.status(400).json({ 
        error: "Bank sudah diisi dan tidak bisa diedit lagi." 
      });
    }

    // Update detail di tabel user_detail
    await pool.query(
      `UPDATE user_detail SET 
        alamat = COALESCE($1, alamat), 
        no_rek = COALESCE($2, no_rek), 
        nama_rekening = COALESCE($3, nama_rekening), 
        bank = COALESCE($4, bank),
        province_id = COALESCE($5, province_id),
        regency_id = COALESCE($6, regency_id),
        district_id = COALESCE($7, district_id),
        postal_code = COALESCE($8, postal_code),
        updated_at = NOW()
      WHERE user_id = $9`,
      [alamat, no_rek, nama_rekening, bank, province_id, regency_id, district_id, postal_code, userId]
    );

    // Ambil data terbaru dengan informasi wilayah
    const userResult = await pool.query(
      "SELECT id, name, email, status, phone, created_on, is_partnership FROM users WHERE id = $1",
      [userId]
    );
    
    const detailResult = await pool.query(`
      SELECT ud.*, 
             p.name as province_name,
             r.name as regency_name, r.type as regency_type,
             d.name as district_name
      FROM user_detail ud
      LEFT JOIN provinces p ON ud.province_id = p.id
      LEFT JOIN regencies r ON ud.regency_id = r.id
      LEFT JOIN districts d ON ud.district_id = d.id
      WHERE ud.user_id = $1
    `, [userId]);

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: userResult.rows[0],
      detail: detailResult.rows[0]
    });
  } catch (err) {
    console.error("Update profile detail error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get provinces
async function getProvinces(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, code, name FROM provinces ORDER BY name ASC"
    );

    return res.status(200).json({
      status: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Get provinces error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get regencies by province
async function getRegencies(req, res) {
  try {
    const { province_id } = req.params;

    const result = await pool.query(
      "SELECT id, code, name, type FROM regencies WHERE province_id = $1 ORDER BY name ASC",
      [province_id]
    );

    return res.status(200).json({
      status: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Get regencies error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get districts by regency
async function getDistricts(req, res) {
  try {
    const { regency_id } = req.params;

    const result = await pool.query(
      "SELECT id, code, name FROM districts WHERE regency_id = $1 ORDER BY name ASC",
      [regency_id]
    );

    return res.status(200).json({
      status: true,
      data: result.rows
    });
  } catch (err) {
    console.error("Get districts error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { 
  getProfile, 
  getProfileDetail, 
  updateProfileDetail, 
  getProvinces, 
  getRegencies, 
  getDistricts,
  searchUserByEmailOrPhoneController
};