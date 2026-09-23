// One-off script: creates the product_payment_links table backing the
// no-code "Product Payment Link" feature (a permanent, reusable link a
// seller pastes on their own website — every click creates a fresh
// transaction). Safe to re-run (CREATE TABLE IF NOT EXISTS).
//
// Usage: node scripts/createProductLinksTable.js

const pool = require("../config/db");

async function run() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_payment_links (
      id SERIAL PRIMARY KEY,
      seller_id INT4 NOT NULL,
      token VARCHAR(40) NOT NULL,
      title VARCHAR(255) NOT NULL,
      total_amount NUMERIC(12,2) NOT NULL,
      fee_by VARCHAR(10) NOT NULL DEFAULT 'buyer',
      categ_id INT4,
      notes TEXT,
      product_images TEXT[],
      shipping_option BOOL NOT NULL DEFAULT false,
      shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
      work_duration INT4,
      is_active BOOL NOT NULL DEFAULT true,
      created_at TIMESTAMP(6) DEFAULT now(),
      updated_at TIMESTAMP(6) DEFAULT now()
    );
  `);
  console.log("product_payment_links table ready");

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS product_payment_links_token_unique ON product_payment_links (token);
  `);
  console.log("product_payment_links.token unique index ready");

  await pool.end();
}

run().catch((error) => {
  console.error("createProductLinksTable failed:", error);
  process.exit(1);
});
