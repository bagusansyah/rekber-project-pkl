const pool = require("../config/db");

async function getFeeRuleByAmount(amount) {
  const result = await pool.query(
    `SELECT * FROM fee_rules
     WHERE min_amount <= $1 AND (max_amount IS NULL OR max_amount >= $1)
     ORDER BY min_amount DESC
     LIMIT 1`,
    [amount]
  );
  return result.rows[0];
}

module.exports = { getFeeRuleByAmount };