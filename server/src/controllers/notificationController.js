const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { sanitizePagination } = require('../utils/queryHelper');

/**
 * Format relative time (e.g. '10m ago', '2h ago', '1d ago')
 */
const getRelativeTime = (date) => {
  if (!date) return 'just now';
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
};

/**
 * Format notification object for client UI
 */
const formatNotification = (doc) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  return {
    id: plain._id,
    _id: plain._id,
    title: plain.title,
    message: plain.message,
    type: plain.type,
    action: plain.action,
    entityType: plain.entityType,
    entityId: plain.entityId,
    read: plain.isRead,
    isRead: plain.isRead,
    time: getRelativeTime(plain.createdAt),
    createdAt: plain.createdAt,
    actorName: plain.actor?.name || 'System',
    actorAvatar: plain.actor?.avatar || ''
  };
};

/**
 * Get notifications for current user (or broadcast)
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { unread, limit = 20, page = 1 } = req.query;

    const query = {};

    // Non-admins see only notifications addressed to them or broadcast (null)
    if (req.user.role !== 'Admin') {
      query.$or = [
        { recipient: req.user.id },
        { recipient: null }
      ];
    }

    if (unread === 'true' || unread === true) {
      query.isRead = false;
    }

    const { page: pageNum, limit: limitNum, skip } = sanitizePagination(page, limit, 50);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .select('title message type action entityType entityId recipient actor isRead readAt createdAt')
        .populate('actor', 'name email avatar')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        ...query,
        isRead: false
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: notifications.map(formatNotification),
      unreadCount,
      meta: {
        total,
        unreadCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return next(
        new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND')
      );
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return ApiResponse.success(res, formatNotification(notification), 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read for current user
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const targetFilter = {
      isRead: false
    };
    if (req.user.role !== 'Admin') {
      targetFilter.$or = [{ recipient: req.user.id }, { recipient: null }];
    }

    await Notification.updateMany(
      targetFilter,
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return ApiResponse.success(res, { success: true }, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return next(
        new AppError('Notification not found', HTTP_STATUS.NOT_FOUND, 'NOTIFICATION_NOT_FOUND')
      );
    }

    await Notification.findByIdAndDelete(id);

    return ApiResponse.success(res, { id }, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all notifications for current user
 * DELETE /api/notifications
 */
const clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({
      $or: [{ recipient: req.user.id }, { recipient: null }]
    });

    return ApiResponse.success(res, { success: true }, 'All notifications cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll
};
