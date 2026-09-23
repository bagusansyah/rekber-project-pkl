// utils/idCipher.js
// Reversible encryption for numeric DB ids exposed in admin dashboard URLs,
// so sequential ids (e.g. /dashboard/transactions/93) aren't visible/guessable.
const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.ID_CIPHER_SECRET;
if (!SECRET) {
  throw new Error("ID_CIPHER_SECRET is not set in environment variables");
}
const KEY = crypto.createHash("sha256").update(SECRET).digest();

function toBase64Url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  let base64 = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64");
}

function encryptId(id) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(id), "utf8"), cipher.final()]);
  return toBase64Url(Buffer.concat([iv, encrypted]));
}

// Accepts either an encrypted token or (for backward compatibility with any
// still-existing raw numeric links, e.g. old notifications) a plain numeric id.
function decryptId(token) {
  const raw = String(token);

  try {
    const buffer = fromBase64Url(raw);
    const iv = buffer.subarray(0, 16);
    const encrypted = buffer.subarray(16);
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    if (/^\d+$/.test(decrypted)) return decrypted;
  } catch (err) {
    // fall through to legacy/raw-id handling below
  }

  if (/^\d+$/.test(raw)) return raw;

  throw new Error("Invalid or corrupted id");
}

module.exports = { encryptId, decryptId };
