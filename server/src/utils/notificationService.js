const Notification = require('../models/Notification');

/**
 * Safely create a notification without interrupting main request flow
 * @param {Object} payload Notification options
 */
const logNotification = async (payload) => {
  try {
    const notification = await Notification.create({
      title: payload.title,
      message: payload.message,
      type: payload.type || 'system',
      action: payload.action || 'other',
      entityType: payload.entityType || 'System',
      entityId: payload.entityId || null,
      recipient: payload.recipient || null,
      actor: payload.actor || null,
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService Error] Failed to log notification:', error.message);
    return null;
  }
};

module.exports = {
  logNotification
};
