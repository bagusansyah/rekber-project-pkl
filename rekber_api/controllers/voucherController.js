const pool = require('../config/db');

// GET - List vouchers
async function getVouchersController(req, res) {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND code ILIKE $${paramCount}`;
      queryParams.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM vouchers ${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Get vouchers
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const vouchersQuery = `
      SELECT 
        *,
        (usage_limit - used_count) as remaining_usage
      FROM vouchers 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(limit, offset);
    const vouchersResult = await pool.query(vouchersQuery, queryParams);

    const formattedVouchers = vouchersResult.rows.map(voucher => ({
      id: voucher.id,
      code: voucher.code,
      value: parseFloat(voucher.value),
      usage_limit: voucher.usage_limit,
      used_count: voucher.used_count,
      remaining_usage: voucher.remaining_usage,
      is_active: voucher.is_active,
      created_at: voucher.created_at,
      updated_at: voucher.updated_at
    }));

    return res.status(200).json({
      status: true,
      message: "Vouchers retrieved successfully",
      data: {
        vouchers: formattedVouchers,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (err) {
    console.error('Get vouchers error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// GET - Detail voucher
async function getVoucherDetailController(req, res) {
  try {
    const voucherId = req.params.id;

    const result = await pool.query(`
      SELECT 
        *,
        (usage_limit - used_count) as remaining_usage
      FROM vouchers 
      WHERE id = $1
    `, [voucherId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Voucher tidak ditemukan"
      });
    }

    const voucher = result.rows[0];

    // Get usage history
    const usageResult = await pool.query(`
      SELECT 
        vu.*,
        u.name as user_name,
        t.kode_transaksi
      FROM voucher_usage vu
      LEFT JOIN users u ON vu.user_id = u.id
      LEFT JOIN transactions t ON vu.transaction_id = t.id
      WHERE vu.voucher_id = $1
      ORDER BY vu.used_at DESC
      LIMIT 20
    `, [voucherId]);

    return res.status(200).json({
      status: true,
      message: "Voucher detail retrieved successfully",
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          value: parseFloat(voucher.value),
          usage_limit: voucher.usage_limit,
          used_count: voucher.used_count,
          remaining_usage: voucher.remaining_usage,
          is_active: voucher.is_active,
          created_at: voucher.created_at,
          updated_at: voucher.updated_at
        },
        usage_history: usageResult.rows
      }
    });

  } catch (err) {
    console.error('Get voucher detail error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// POST - Create voucher
async function createVoucherController(req, res) {
  try {
    const { code, value, usage_limit } = req.body;

    // Validasi input
    if (!code || !value || !usage_limit) {
      return res.status(400).json({
        status: false,
        error: "Field wajib: code, value, usage_limit"
      });
    }

    if (value <= 0) {
      return res.status(400).json({
        status: false,
        error: "Value harus lebih dari 0"
      });
    }

    if (usage_limit <= 0) {
      return res.status(400).json({
        status: false,
        error: "Usage limit harus lebih dari 0"
      });
    }

    // Check kode voucher sudah ada
    const existingVoucher = await pool.query('SELECT id FROM vouchers WHERE code = $1', [code]);
    if (existingVoucher.rows.length > 0) {
      return res.status(400).json({
        status: false,
        error: "Kode voucher sudah ada"
      });
    }

    const result = await pool.query(`
      INSERT INTO vouchers (code, value, usage_limit)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [code.toUpperCase(), value, usage_limit]);

    return res.status(201).json({
      status: true,
      message: "Voucher berhasil dibuat",
      data: result.rows[0]
    });

  } catch (err) {
    console.error('Create voucher error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// PUT - Update voucher
async function updateVoucherController(req, res) {
  try {
    const voucherId = req.params.id;
    const { code, value, usage_limit, is_active } = req.body;

    // Check voucher exists
    const existingVoucher = await pool.query('SELECT * FROM vouchers WHERE id = $1', [voucherId]);
    if (existingVoucher.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Voucher tidak ditemukan"
      });
    }

    // Build update query
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (code !== undefined) {
      // Check kode voucher sudah ada (selain voucher ini)
      const codeCheck = await pool.query('SELECT id FROM vouchers WHERE code = $1 AND id != $2', [code, voucherId]);
      if (codeCheck.rows.length > 0) {
        return res.status(400).json({
          status: false,
          error: "Kode voucher sudah ada"
        });
      }
      paramCount++;
      updateFields.push(`code = $${paramCount}`);
      queryParams.push(code.toUpperCase());
    }

    if (value !== undefined) {
      if (value <= 0) {
        return res.status(400).json({
          status: false,
          error: "Value harus lebih dari 0"
        });
      }
      paramCount++;
      updateFields.push(`value = $${paramCount}`);
      queryParams.push(value);
    }

    if (usage_limit !== undefined) {
      if (usage_limit <= 0) {
        return res.status(400).json({
          status: false,
          error: "Usage limit harus lebih dari 0"
        });
      }
      paramCount++;
      updateFields.push(`usage_limit = $${paramCount}`);
      queryParams.push(usage_limit);
    }

    if (is_active !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      queryParams.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: false,
        error: "Tidak ada field yang diupdate"
      });
    }

    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    queryParams.push(new Date());

    // Add WHERE clause
    paramCount++;
    queryParams.push(voucherId);

    const updateQuery = `
      UPDATE vouchers 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, queryParams);

    return res.status(200).json({
      status: true,
      message: "Voucher berhasil diupdate",
      data: result.rows[0]
    });

  } catch (err) {
    console.error('Update voucher error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// DELETE - Delete voucher
async function deleteVoucherController(req, res) {
  try {
    const voucherId = req.params.id;

    // Check voucher exists
    const existingVoucher = await pool.query('SELECT * FROM vouchers WHERE id = $1', [voucherId]);
    if (existingVoucher.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Voucher tidak ditemukan"
      });
    }

    // Check if voucher has been used
    const usageCheck = await pool.query('SELECT COUNT(*) as count FROM voucher_usage WHERE voucher_id = $1', [voucherId]);
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        status: false,
        error: "Voucher tidak dapat dihapus karena sudah pernah digunakan"
      });
    }

    await pool.query('DELETE FROM vouchers WHERE id = $1', [voucherId]);

    return res.status(200).json({
      status: true,
      message: "Voucher berhasil dihapus"
    });

  } catch (err) {
    console.error('Delete voucher error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// POST - Apply voucher (untuk user)
async function applyVoucherController(req, res) {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        status: false,
        error: "Kode voucher wajib diisi"
      });
    }

    // Get voucher by code
    const voucherResult = await pool.query(`
      SELECT * FROM vouchers 
      WHERE code = $1 AND is_active = true
    `, [code.toUpperCase()]);

    if (voucherResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Kode voucher tidak valid atau sudah tidak aktif"
      });
    }

    const voucher = voucherResult.rows[0];

    // Check usage limit
    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        status: false,
        error: "Voucher sudah mencapai batas penggunaan"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Voucher valid",
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        discount_amount: parseFloat(voucher.value),
        remaining_usage: voucher.usage_limit - voucher.used_count
      }
    });

  } catch (err) {
    console.error('Apply voucher error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

module.exports = {
  getVouchersController,
  getVoucherDetailController,
  createVoucherController,
  updateVoucherController,
  deleteVoucherController,
  applyVoucherController
};