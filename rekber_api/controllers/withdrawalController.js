const pool = require('../config/db');

// --- 1. FUNGSI AMBIL DATA ---
const getAllWithdrawals = async (req, res) => {
  try {
    const query = `
      SELECT
        t.id,
        t.kode_transaksi,
        t.total_amount AS amount,
        COALESCE(ud.bank, 'Belum Diatur') AS bank_name,
        COALESCE(ud.no_rek, 'Belum Diatur') AS account_number,
        u.name AS account_holder,
        t.status,
        TO_CHAR(t.created_at, 'DD Mon YYYY') as date,
        u.name as seller_name,
        u.email
      FROM transactions t
      JOIN users u ON t.seller_id = u.id
      LEFT JOIN user_detail ud ON u.id = ud.user_id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query);

    const formattedData = result.rows.map(row => {
      let frontStatus = 'MENUNGGU';
      if (row.status && row.status.toLowerCase() === 'disbursed') {
        frontStatus = 'SELESAI';
      }
      return { ...row, status: frontStatus };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error Ambil Data:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- 2. FUNGSI UPDATE STATUS ---
const updateWithdrawalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    let dbStatus = status;
    // Kalau admin klik Selesai di web, kita simpan 'disbursed' ke database
    if (status === 'SELESAI') {
      dbStatus = 'disbursed'; 
    }

    const query = `UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await pool.query(query, [dbStatus, id]);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error Update Data:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// --- 3. EXPORT KE ROUTES ---
module.exports = {
  getAllWithdrawals,
  updateWithdrawalStatus
};