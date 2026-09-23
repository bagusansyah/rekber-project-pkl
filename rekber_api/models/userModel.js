// models/userModel.js
const pool = require("../config/db");

async function createUser(name, email, password, activateToken = null, phone) {
  const query = `
    INSERT INTO users (name, email, password, activate_token, status, created_on, phone) 
    VALUES ($1, $2, $3, $4, 0, NOW(), $5) 
    RETURNING *
  `;
  const values = [name, email, password, activateToken, phone];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function createUserDetail({ user_id}) {
  await pool.query(
    "INSERT INTO user_detail (user_id) VALUES ($1)",
    [user_id]
  );
}

async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password, status, is_admin, is_verified, phone, is_partnership, partnership_percentage, partnership_expires_at FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result;
}
function normalizePhone(phone) {
  if (!phone) return phone;
  let p = phone.toString().trim();
  // remove spaces, dashes, parentheses
  p = p.replace(/[\s\-()]/g, '');
  // already has +
  if (p.startsWith('+')) return p;
  // starts with 0 -> replace with +62
  if (p.startsWith('0')) return '+62' + p.slice(1);
  // starts with 62 -> add +
  if (p.startsWith('62')) return '+' + p;
  // starts with 8 (local without leading 0) -> +62...
  if (p.startsWith('8')) return '+62' + p;
  // fallback: numeric -> prefix +
  if (/^\d+$/.test(p)) return '+' + p;
  return p;
}

async function findUserByNoHp(phone) {
  const normalized = normalizePhone(phone);
  const result = await pool.query(
    `SELECT id, name, email, password, status, is_admin, is_verified, phone, is_partnership, partnership_percentage, partnership_expires_at FROM users WHERE phone = $1`,
    [normalized]
  );
  return result;
}


async function findUserByPhone(phone) {
  const result = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
  return result;
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, password, is_partnership, partnership_percentage, partnership_expires_at FROM users WHERE id = $1`,
    [id]
  );
  return result;
}
async function findUserByActivateToken(token) {
  const query = 'SELECT * FROM users WHERE activate_token = $1';
  return await pool.query(query, [token]);
}

async function activateUser(userId) {
  const query = `
    UPDATE users 
    SET status = 1, activate_token = NULL, activated_on = NOW() 
    WHERE id = $1 
    RETURNING *
  `;
  return await pool.query(query, [userId]);
}
async function getUserDetailByUserId(userId) {
  const result = await pool.query(
    "SELECT alamat, no_rek, nama_rekening, bank FROM user_detail WHERE user_id = $1",
    [userId]
  );
  return result.rows[0];
}

async function findUserByGoogleId(googleId) {
  const result = await pool.query(
    `SELECT id, name, email, password, status, is_admin, phone, is_partnership, partnership_percentage, partnership_expires_at FROM users WHERE google_id = $1`,
    [googleId]
  );
  return result;
}

async function linkGoogleId(userId, googleId) {
  await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, userId]);
}

async function createUserFromGoogle({ name, email, googleId, passwordHash }) {
  const query = `
    INSERT INTO users (name, email, password, google_id, status, created_on)
    VALUES ($1, $2, $3, $4, 1, NOW())
    RETURNING *
  `;
  const result = await pool.query(query, [name, email, passwordHash, googleId]);
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserByNoHp, findUserById, findUserByActivateToken, activateUser, findUserByPhone, getUserDetailByUserId, createUserDetail, findUserByGoogleId, linkGoogleId, createUserFromGoogle };