const pool = require('../config/db');

// Function untuk membuat notifikasi dan mengirim real-time
async function createAndSendNotification(data) {
  try {
    const { user_id, title, message, type, data: notificationData } = data;

    // Insert notification to database
    const result = await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [user_id, title, message, type, notificationData ? JSON.stringify(notificationData) : null]);

    const notification = result.rows[0];

    // Send real-time notification via Socket.IO
    if (global.io) {
      global.io.to(`user_${user_id}`).emit('new_notification', notification);
      console.log(`Real-time notification sent to user ${user_id}:`, notification.title);
    }

    return notification;
  } catch (err) {
    console.error('Create and send notification error:', err);
    throw err;
  }
}

// Bulk notification untuk multiple users
async function createAndSendBulkNotifications(notifications) {
  try {
    const promises = notifications.map(notificationData => 
      createAndSendNotification(notificationData)
    );
    
    const results = await Promise.all(promises);
    console.log(`Sent ${results.length} bulk notifications`);
    
    return results;
  } catch (err) {
    console.error('Bulk notifications error:', err);
    throw err;
  }
}

module.exports = {
  createAndSendNotification,
  createAndSendBulkNotifications
};