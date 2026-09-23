const cron = require('node-cron');
const pool = require('./config/db'); // Pastikan path ke db benar

// Kita bungkus dalam fungsi agar bisa menerima 'io' dari index.js
const startCronJobs = (io) => {
  console.log("------------------------------------------------");
  console.log("⏳ Sistem Cron Job Aktif! Menunggu jadwal...");
  console.log("------------------------------------------------");

  // CRON JOB: Jalan setiap 1 menit ('* * * * *')
  // Untuk testing presentasi, Anda bisa ganti jadi tiap 10 detik ('*/10 * * * * *')
  cron.schedule('* * * * *', async () => {
    console.log(`\n[${new Date().toLocaleTimeString()}] 🔄 [CRON] Mengecek transaksi kedaluwarsa...`);
    
    try {
      // 1. CARI TRANSAKSI KEDALUWARSA DI DATABASE
      // Ambil transaksi yang statusnya draft/wait_payment dan waktu sekarang sudah melewati expired_at
      const checkQuery = `
        SELECT id, kode_transaksi, status, buyer_id, seller_id
        FROM transactions
        WHERE status IN ('draft', 'wait_payment')
        AND expired_at < NOW()
      `;
      const { rows: expiredTransactions } = await pool.query(checkQuery);

      if (expiredTransactions.length === 0) {
        console.log("💤 Tidak ada transaksi kedaluwarsa. Menunggu siklus berikutnya...");
        return; // Berhenti di sini jika aman
      }

      console.log(`⚠️ Ditemukan ${expiredTransactions.length} transaksi kedaluwarsa. Memproses pembatalan...`);

      // 2. PROSES PEMBATALAN SATU PER SATU
      for (const trx of expiredTransactions) {
        // A. Ubah status transaksi menjadi 'cancel'
        // await pool.query(
        //   `UPDATE transactions SET status = 'cancel', updated_at = NOW() WHERE id = $1`,
        //   [trx.id]
        // );
        await pool.query(
            `UPDATE transactions SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
            [trx.id]
          );

        // B. Catat sejarah di transaction_status_logs (Penting untuk jejak audit)
        // await pool.query(
        //   `INSERT INTO transaction_status_logs (transaction_id, status, name, note) 
        //    VALUES ($1, 'cancel', 'Dibatalkan Sistem', 'Transaksi dibatalkan otomatis karena melewati batas waktu 24 jam')`,
        //   [trx.id]
        // );
        await pool.query(
            `INSERT INTO transaction_status_logs (transaction_id, status, name, note) 
             VALUES ($1, 'cancelled', 'Dibatalkan Sistem', 'Transaksi dibatalkan otomatis karena melewati batas waktu 24 jam')`,
            [trx.id]
          );

        // C. HUBUNGKAN DENGAN FRONTEND FAJAR (SOCKET.IO)
        // if (io) {
        //   io.to(`transaction_${trx.id}`).emit("transaction_status_update", {
        //     transaction_id: trx.id,
        //     status: 'cancel'
        //   });
        // }
        if (io) {
            io.to(`transaction_${trx.id}`).emit("transaction_status_update", {
              transaction_id: trx.id,
              status: 'cancelled'
            });
          }
      }

      // 3. TAMPILKAN LAPORAN DI TERMINAL
      console.log(`✅ BERHASIL: ${expiredTransactions.length} transaksi telah dibatalkan (EXPIRED).`);
      
      // Memformat data agar tampil cantik di tabel terminal seperti buatan Bagus
      const reportData = expiredTransactions.map(t => ({ 
        id: t.id, 
        kode_transaksi: t.kode_transaksi, 
        old_status: t.status, 
        new_status: 'CANCEL' 
      }));
      console.table(reportData);

    } catch (error) {
      console.error("❌ [CRON ERROR] Terjadi kesalahan:", error.message);
    }
  });
};

module.exports = startCronJobs;