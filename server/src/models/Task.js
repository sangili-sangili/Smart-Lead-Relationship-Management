const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../constants/statusEnums');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated lead is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(TASK_STATUS),
        message: '{VALUE} is not a valid task status'
      },
      default: TASK_STATUS.PENDING
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(TASK_PRIORITY),
        message: '{VALUE} is not a valid task priority'
      },
      default: TASK_PRIORITY.MEDIUM
    },
    description: {
      type: String,
      trim: true,
      default: ''
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

// Performance & Query Indexes (ESR pattern for sorting and filtering)
taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1, _id: -1 });
taskSchema.index({ status: 1, dueDate: 1, _id: -1 });
taskSchema.index({ dueDate: 1, createdAt: -1, _id: -1 });
taskSchema.index({ lead: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
