const pool = require('../config/db');

// GET - List notifikasi user
async function getNotificationsController(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, is_read } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE user_id = $1";
    let queryParams = [userId];
    let paramCount = 1;

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      queryParams.push(type);
    }

    if (is_read !== undefined) {
      paramCount++;
      whereClause += ` AND is_read = $${paramCount}`;
      queryParams.push(is_read === 'true');
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    const totalResult = await pool.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].total);

    // Get notifications
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const notificationsQuery = `
      SELECT * FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    queryParams.push(limit, offset);
    const notificationsResult = await pool.query(notificationsQuery, queryParams);

    // Get unread count
    const unreadCountResult = await pool.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications: notificationsResult.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        },
        unread_count: parseInt(unreadCountResult.rows[0].unread_count)
      }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// PUT - Mark notification as read
async function markAsReadController(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Notifikasi tidak ditemukan"
      });
    }

    // Emit update to user
    if (global.io) {
      global.io.to(`user_${userId}`).emit('notification_read', {
        notification_id: notificationId
      });
    }

    return res.status(200).json({
      status: true,
      message: "Notifikasi berhasil ditandai sudah dibaca",
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// PUT - Mark all notifications as read
async function markAllAsReadController(req, res) {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    // Emit update to user
    if (global.io) {
      global.io.to(`user_${userId}`).emit('all_notifications_read');
    }

    return res.status(200).json({
      status: true,
      message: "Semua notifikasi berhasil ditandai sudah dibaca"
    });
  } catch (err) {
    console.error('Mark all as read error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// DELETE - Delete notification
async function deleteNotificationController(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Notifikasi tidak ditemukan"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Notifikasi berhasil dihapus"
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// Function untuk membuat notifikasi baru (digunakan internal)
async function createNotification(data) {
  try {
    const { user_id, title, message, type, data: notificationData } = data;

    const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, message, type, notificationData ? JSON.stringify(notificationData) : null]);

    const notification = result.rows[0];

    // Emit real-time notification
    if (global.io) {
      global.io.to(`user_${user_id}`).emit('new_notification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    throw err;
  }
}

// GET - List notifikasi khusus ADMIN (Global History)
async function getAdminNotificationsController(req, res) {
  try {
    const query = `
      SELECT * FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    const result = await pool.query(query);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Get admin notifications error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

// PUT - Tandai notifikasi sudah dibaca (Khusus Admin)
async function markAdminNotificationAsReadController(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE notifications SET is_read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        error: "Notifikasi tidak ditemukan"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Notifikasi ditandai sudah dibaca",
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Mark admin read error:', err);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
}

module.exports = {
  getNotificationsController,
  markAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  createNotification,
  getAdminNotificationsController,
  markAdminNotificationAsReadController
};
