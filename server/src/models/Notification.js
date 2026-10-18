const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['lead', 'task', 'company', 'status', 'milestone', 'system'],
      default: 'system'
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'assign', 'status_change', 'other'],
      default: 'other'
    },
    entityType: {
      type: String,
      enum: ['Lead', 'Task', 'Company', 'User', 'System'],
      default: 'System'
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityType',
      default: null
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates broadcast to all CRM agents / Admins
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // User who triggered the action
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ entityType: 1, entityId: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
