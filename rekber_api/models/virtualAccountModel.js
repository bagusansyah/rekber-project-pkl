const pool = require("../config/db");

async function createVirtualAccount(vaData) {
  const query = `
    INSERT INTO virtual_accounts (
      refid, trxid, channel, va_number, amount, 
      description, expired_at, provider_response, qr_string
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const values = [
    vaData.refid,
    vaData.trxid,
    vaData.channel,
    vaData.va_number,
    vaData.amount,
    vaData.description,
    vaData.expired_at,
    JSON.stringify(vaData.provider_response),
    vaData.qr_string
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findVAByRefidAndChannel(refid, channel) {
  const query = `
    SELECT * FROM virtual_accounts 
    WHERE refid = $1 
    AND channel = $2 
    AND status = 'active' 
    AND expired_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  const result = await pool.query(query, [refid, channel]);
  return result.rows[0] || null;
}

async function findVAByTrxid(trxid) {
  const query = `
    SELECT * FROM virtual_accounts 
    WHERE trxid = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  const result = await pool.query(query, [trxid]);
  return result.rows[0] || null;
}

async function updateVAStatus(id, status) {
  const query = `
    UPDATE virtual_accounts 
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
}

async function expireOldVAs() {
  const query = `
    UPDATE virtual_accounts 
    SET status = 'expired', updated_at = NOW()
    WHERE expired_at < NOW() AND status = 'active'
    RETURNING *
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

module.exports = {
  createVirtualAccount,
  findVAByRefidAndChannel,
  findVAByTrxid,
  updateVAStatus,
  expireOldVAs
};