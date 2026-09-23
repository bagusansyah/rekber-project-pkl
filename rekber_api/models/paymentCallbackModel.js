// models/paymentCallbackModel.js
const pool = require("../config/db");

async function createPaymentCallback(callbackData) {
  const query = `
    INSERT INTO payment_callbacks (
      transaction_id, payment_gateway, external_id, payment_method, 
      status, amount, currency, fee, net_amount, reference_id,
      payment_channel, bank_code, va_number, qr_string, ewallet_type,
      callback_data, signature, is_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `;
  
  const values = [
    callbackData.transaction_id,
    callbackData.payment_gateway,
    callbackData.external_id,
    callbackData.payment_method,
    callbackData.status,
    callbackData.amount,
    callbackData.currency || 'IDR',
    callbackData.fee || 0,
    callbackData.net_amount,
    callbackData.reference_id,
    callbackData.payment_channel,
    callbackData.bank_code,
    callbackData.va_number,
    callbackData.qr_string,
    callbackData.ewallet_type,
    JSON.stringify(callbackData.raw_data),
    callbackData.signature,
    callbackData.is_verified || false
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findCallbackByExternalId(externalId, gateway) {
  const query = `
    SELECT * FROM payment_callbacks 
    WHERE external_id = $1 AND payment_gateway = $2
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [externalId, gateway]);
  return result;
}

async function updateCallbackStatus(id, status, processedAt = null) {
  const query = `
    UPDATE payment_callbacks 
    SET status = $1, processed_at = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, processedAt || new Date(), id]);
  return result.rows[0];
}

async function markCallbackAsVerified(id) {
  const query = `
    UPDATE payment_callbacks 
    SET is_verified = true, updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function getCallbacksByTransactionId(transactionId) {
  const query = `
    SELECT * FROM payment_callbacks 
    WHERE transaction_id = $1
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [transactionId]);
  return result;
}

module.exports = {
  createPaymentCallback,
  findCallbackByExternalId,
  updateCallbackStatus,
  markCallbackAsVerified,
  getCallbacksByTransactionId
};