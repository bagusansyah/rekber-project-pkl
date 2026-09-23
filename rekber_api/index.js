const express = require("express");
const cron = require('node-cron');
const cors = require('cors');
require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });
const http = require("http");
const { Server } = require("socket.io");
const pool = require("./config/db");
const { decryptId } = require("./utils/idCipher");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionsRoutes");
const paymentRoutes = require('./routes/paymentRoutes');
const paymentChannelRoutes = require("./routes/paymentChanelRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const forgotPasswordRoutes = require("./routes/forgotPasswordRoutes");
const withdrawalRoutes = require('./routes/withdrawalRoutes');
const publicTransactionRoutes = require("./routes/publicTransactionRoutes");
const productLinkRoutes = require("./routes/productLinkRoutes");
const publicProductLinkRoutes = require("./routes/publicProductLinkRoutes");

const app = express();

const resolveTransactionId = (value) => decryptId(value);

// Only the buyer, seller, or an admin may join/read/send a transaction's chat.
async function canAccessTransactionChat(transactionId, userId) {
  const result = await pool.query(
    `SELECT 1
     FROM transactions t
     WHERE t.id = $1
       AND (
         t.buyer_id = $2
         OR t.seller_id = $2
         OR t.created_by = $2
         OR EXISTS (SELECT 1 FROM users u WHERE u.id = $2 AND u.is_admin::int != 0)
       )`,
    [transactionId, userId]
  );
  return result.rowCount > 0;
}

const normalizeOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch (error) {
    return origin.trim().replace(/\/$/, "").toLowerCase();
  }
};

const allowedOrigins = [
  "https://rekber.com",
  "https://www.rekber.com",
  "https://admin.rekber.com",
];

const normalizedAllowedOrigins = new Set(
  allowedOrigins.map((origin) => normalizeOrigin(origin))
);

const isLocalDevelopmentOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      Boolean(url.port)
    );
  } catch (error) {
    return false;
  }
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);

    if (
      normalizedAllowedOrigins.has(normalizedOrigin) ||
      isLocalDevelopmentOrigin(origin)
    ) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use('/api/transactions', transactionRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// MAKE IO AVAILABLE GLOBALLY
global.io = io;
app.set('io', io);

// Routes - SETELAH io di-setup
const chatRoutes = require("./routes/chatRoutes");

app.use("/auth", authRoutes);
app.use("/", userRoutes);
app.use("/transactions", transactionRoutes);
app.use('/payment', paymentRoutes);
app.use("/payment-channels", paymentChannelRoutes);
app.use("/admin/auth", adminAuthRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/reports", reportsRoutes);
app.use("/chat", chatRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/forgot-password", forgotPasswordRoutes);
app.use("/public/transactions", publicTransactionRoutes);
app.use("/product-links", productLinkRoutes);
app.use("/public/product-links", publicProductLinkRoutes);
app.use("/api/blogs", require("./routes/blogsRoutes")); // Rute baru untuk Blog API
app.use("/api/categories", require("./routes/categoriesRoutes"));
app.use("/api/static-pages", require("./routes/staticPagesRoutes"));
app.use("/api/kyc", require("./routes/kycRoutes"));

// TEMPORARY TEST ROUTE FOR ADMIN PUSH NOTIFICATION
app.get("/test-admin-notif", (req, res) => {
  if (global.io) {
    const adminNotifData = {
      id: Date.now(),
      type: "transaction",
      title: "Uji Coba Push Notification",
      message: "Ini adalah notifikasi percobaan dari backend lokal! Push notification berfungsi!",
      created_at: new Date().toISOString(),
      data: { transaction_id: 123456 }
    };
    global.io.emit("admin_notification", adminNotifData);
    console.log("🔔 [TEST] Notifikasi admin dikirim via /test-admin-notif");
    res.json({ success: true, message: "Notifikasi admin telah di trigger!" });
  } else {
    res.status(500).json({ success: false, message: "Socket.IO tidak berjalan" });
  }
});

const PORT = process.env.PORT || 5000;

// === FUNGSI MIGRASI DATABASE OTOMATIS (Added by Fajar) ===
const autoUpdateDatabase = async () => {
  try {
    console.log("🛠️  System Check: Memeriksa struktur database...");
    
    await pool.query(`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS expired_at TIMESTAMP DEFAULT NULL;
    `);

    console.log("✅ Database Ready: Kolom 'expired_at' aman (dibuat/sudah ada).");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS kyc_verifications (
        id SERIAL PRIMARY KEY,
        user_id INT4 NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        nik VARCHAR(16) NOT NULL,
        ktp_photo_url TEXT NOT NULL,
        selfie_with_ktp_url TEXT NOT NULL,
        selfie_video_url TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        rejection_reason TEXT,
        reviewed_by INT4,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database Ready: Tabel 'kyc_verifications' aman (dibuat/sudah ada).");

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique ON users(google_id) WHERE google_id IS NOT NULL;
    `);

    console.log("✅ Database Ready: Kolom 'google_id' aman (dibuat/sudah ada).");

    await pool.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS product_images TEXT[];
    `);

    console.log("✅ Database Ready: Kolom 'product_images' aman (dibuat/sudah ada).");

    // Product Payment Link: nullable, populated only when a transaction was
    // spawned by a buyer clicking a seller's permanent product link.
    await pool.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS product_link_id INT4;
    `);

    console.log("✅ Database Ready: Kolom 'product_link_id' aman (dibuat/sudah ada).");
  } catch (err) {
    console.error("⚠️  Database Update Error:", err.message);
  }
};

// EKSEKUSI: Jalankan update database dulu, BARU nyalakan server
autoUpdateDatabase().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log('User connected:', socket.id);
  
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
  let userId = null;
  
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      socket.userId = userId;
      
      socket.join(`user_${userId}`);
      console.log('User authenticated and joined notification room:', userId);
    } catch (err) {
      console.log("Invalid token on socket:", err.message);
      socket.emit("error", { error: "Invalid authentication token" });
    }
  }

  // ==== HELPER FUNCTION FOR CONSISTENT NOTIFICATION FORMATTING ====
  const formatNotification = (notification) => {
    let parsedData = null;
    let transactionId = null;
    
    try {
      if (typeof notification.data === 'string') {
        parsedData = JSON.parse(notification.data);
      } else if (typeof notification.data === 'object' && notification.data !== null) {
        parsedData = notification.data;
      } else {
        parsedData = {};
      }
      
      if (parsedData) {
        transactionId = parsedData.transaction_id || 
                      parsedData.transactionId || 
                      parsedData.id || 
                      null;
      }
      
    } catch (e) {
      console.error('Error parsing notification data:', e);
      parsedData = {};
      transactionId = null;
    }

    return {
      ...notification,
      data: parsedData,
      transaction_id: transactionId
    };
  };

  // ==== NOTIFICATION EVENTS ====
  
  socket.on('get_notifications', async () => {
    if (!userId) {
      socket.emit("error", { error: "Unauthorized" });
      return;
    }

    try {
      const notificationsResult = await pool.query(`
        SELECT * FROM notifications 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 50
      `, [userId]);

      const unreadCountResult = await pool.query(`
        SELECT COUNT(*) as unread_count 
        FROM notifications 
        WHERE user_id = $1 AND is_read = false
      `, [userId]);

      const formattedNotifications = notificationsResult.rows.map(formatNotification);

      const initialData = {
        notifications: formattedNotifications,
        unread_count: parseInt(unreadCountResult.rows[0].unread_count)
      };

      socket.emit('initial_notifications', initialData);
      console.log(`Sent initial notifications to user ${userId}:`, initialData.notifications.length, 'notifications');

    } catch (error) {
      console.error('Error getting initial notifications:', error);
      socket.emit("error", { error: "Failed to get notifications" });
    }
  });

  socket.on('mark_notification_read', async (data) => {
    if (!userId) {
      socket.emit("error", { error: "Unauthorized" });
      return;
    }

    try {
      const { notification_id } = data;
      
      const result = await pool.query(`
        UPDATE notifications 
        SET is_read = true, updated_at = NOW() 
        WHERE id = $1 AND user_id = $2 
        RETURNING *
      `, [notification_id, userId]);

      if (result.rows.length > 0) {
        socket.emit('notification_read', { notification_id });
        console.log(`Notification ${notification_id} marked as read by user ${userId}`);
      }

    } catch (error) {
      console.error('Error marking notification as read:', error);
      socket.emit("error", { error: "Failed to mark notification as read" });
    }
  });

  socket.on('mark_all_notifications_read', async () => {
    if (!userId) {
      socket.emit("error", { error: "Unauthorized" });
      return;
    }

    try {
      await pool.query(`
        UPDATE notifications 
        SET is_read = true, updated_at = NOW() 
        WHERE user_id = $1 AND is_read = false
      `, [userId]);

      socket.emit('all_notifications_read');
      console.log(`All notifications marked as read for user ${userId}`);

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      socket.emit("error", { error: "Failed to mark all notifications as read" });
    }
  });

  // ==== TRANSACTION CHAT EVENTS ====
  
  socket.on("join_transaction", async (transactionId) => {
    if (!userId) {
      socket.emit("error", { error: "Unauthorized" });
      return;
    }
    
    let resolvedTransactionId;
    try {
      resolvedTransactionId = resolveTransactionId(transactionId);
    } catch (error) {
      socket.emit("error", { error: "Invalid transaction id" });
      return;
    }

    try {
      const allowed = await canAccessTransactionChat(resolvedTransactionId, userId);
      if (!allowed) {
        socket.emit("error", { error: "Unauthorized" });
        return;
      }
    } catch (error) {
      console.error('Error checking transaction chat access:', error);
      socket.emit("error", { error: "Failed to get chat history" });
      return;
    }

    console.log(`User ${userId} joining transaction ${resolvedTransactionId}`);
    socket.join(`transaction_${resolvedTransactionId}`);

    try {
      const result = await pool.query(
        `SELECT c.*, u.name AS user_name, u.is_admin as is_admin
         FROM transaction_chat c
         JOIN users u ON c.user_id = u.id
         WHERE c.transaction_id = $1
         ORDER BY c.created_at ASC`,
        [resolvedTransactionId]
      );

      socket.emit("chat-history", result.rows);
    } catch (error) {
      console.error('Error getting chat history:', error);
      socket.emit("error", { error: "Failed to get chat history" });
    }
  });

  socket.on("send_chat", async (data) => {
    if (!userId) {
      socket.emit("error", { error: "Unauthorized" });
      return;
    }
    
    try {
      const { transaction_id, message } = data;
      const resolvedTransactionId = resolveTransactionId(transaction_id);

      const allowed = await canAccessTransactionChat(resolvedTransactionId, userId);
      if (!allowed) {
        socket.emit("error", { error: "Unauthorized" });
        return;
      }

      const chatResult = await pool.query(
        "INSERT INTO transaction_chat (transaction_id, user_id, message, message_type) VALUES ($1, $2, $3, 'text') RETURNING *",
        [resolvedTransactionId, userId, message]
      );

      const userInfo = await pool.query('SELECT name, is_admin FROM users WHERE id = $1', [userId]);
      const user = userInfo.rows[0];

      const transactionInfo = await pool.query(`
        SELECT 
          t.*,
          buyer.name as buyer_name,
          seller.name as seller_name
        FROM transactions t
        LEFT JOIN users buyer ON t.buyer_id = buyer.id
        LEFT JOIN users seller ON t.seller_id = seller.id
        WHERE t.id = $1
      `, [resolvedTransactionId]);

      if (transactionInfo.rows.length === 0) {
        socket.emit("error", { error: "Transaction not found" });
        return;
      }

      const transaction = transactionInfo.rows[0];

      const chatData = {
        ...chatResult.rows[0],
        user_name: user.name,
        is_admin: user.is_admin
      };
 
      io.to(`transaction_${resolvedTransactionId}`).emit("chat-message", chatData);
      
      // === ADMIN REAL-TIME NOTIFICATION ===
      if (user.is_admin === 0 || user.is_admin === "0" || user.is_admin === false) {
        const adminNotifData = {
          id: Date.now(),
          type: "transaction",
          title: `Pesan Baru - ${transaction.kode_transaksi}`,
          message: `${user.name}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
          created_at: new Date().toISOString(),
          data: { transaction_id: parseInt(resolvedTransactionId) }
        };

        io.emit("admin_notification", adminNotifData);
        console.log(`🔔 Notifikasi admin dikirim untuk transaksi ${transaction.kode_transaksi}`);
      }
      
      // CREATE NOTIFICATIONS FOR OTHER PARTICIPANTS
      const participants = [];
      
      if (transaction.buyer_id && transaction.buyer_id !== userId) {
        participants.push({
          user_id: transaction.buyer_id,
          role: 'buyer',
          name: transaction.buyer_name
        });
      }
      
      if (transaction.seller_id && transaction.seller_id !== userId) {
        participants.push({
          user_id: transaction.seller_id,
          role: 'seller', 
          name: transaction.seller_name
        });
      }

      for (const participant of participants) {
        try {
          const notificationData = {
            transaction_id: parseInt(resolvedTransactionId),
            kode_transaksi: transaction.kode_transaksi,
            sender_id: parseInt(userId),
            sender_name: user.name,
            message: message,
            chat_id: chatResult.rows[0].id
          };

          const notificationResult = await pool.query(`
            INSERT INTO notifications (user_id, title, message, type, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `, [
            participant.user_id,
            `Pesan Baru - ${transaction.kode_transaksi}`,
            `${user.name}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
            'chat',
            JSON.stringify(notificationData)
          ]);

          const notification = notificationResult.rows[0];
          const formattedNotification = formatNotification(notification);

          if (!formattedNotification.transaction_id) {
            console.error('Warning: transaction_id missing in notification:', formattedNotification);
            formattedNotification.transaction_id = parseInt(resolvedTransactionId);
          }

          io.to(`user_${participant.user_id}`).emit('new_notification', formattedNotification);
          console.log(`Chat notification sent to user ${participant.user_id} for transaction ${transaction.kode_transaksi} with transaction_id: ${formattedNotification.transaction_id}`);

        } catch (notifError) {
          console.error('Error creating chat notification:', notifError);
        }
      }
      
      console.log(`Chat message sent in transaction ${resolvedTransactionId} by user ${userId}`);

    } catch (error) { 
      console.error('Error sending chat message:', error);
      socket.emit("error", { error: "Failed to send message" });
    }
  });

  // ==== CONNECTION EVENTS ====
  
  socket.on("disconnect", (reason) => {
    if (userId) {
      socket.leave(`user_${userId}`);
      console.log(`User ${userId} disconnected:`, reason);
    } else {
      console.log('Anonymous user disconnected:', socket.id, 'Reason:', reason);
    }
  });

  socket.on("error", (error) => {
    console.error('Socket error for user', userId || 'anonymous', ':', error);
  });
});

// Cron Jobs
const startCronJobs = require('./cronScheduler');
startCronJobs(global.io);

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
