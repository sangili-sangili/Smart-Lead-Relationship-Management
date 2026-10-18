import api from './api';

export const notificationService = {
  /**
   * Fetch user notifications with unread count
   * @param {{ unreadOnly?: boolean, page?: number, limit?: number }} params
   */
  async getNotifications({ unreadOnly = false, page = 1, limit = 20 } = {}) {
    try {
      const res = await api.get('/notifications', {
        params: { unreadOnly, page, limit }
      });
      return {
        notifications: res.data || [],
        unreadCount: res.meta?.unreadCount || 0,
        meta: res.meta || {}
      };
    } catch (err) {
      console.warn('Failed to fetch notifications from backend', err);
      return { notifications: [], unreadCount: 0, meta: {} };
    }
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  async markAsRead(id) {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      console.warn('Failed to mark notification as read', err);
      return null;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const res = await api.patch('/notifications/read-all');
      return res.data;
    } catch (err) {
      console.warn('Failed to mark all notifications as read', err);
      return null;
    }
  },

  /**
   * Clear / delete all notifications
   */
  async clearAll() {
    try {
      await api.delete('/notifications');
      return true;
    } catch (err) {
      console.warn('Failed to clear notifications', err);
      return false;
    }
  }
};

export default notificationService;
