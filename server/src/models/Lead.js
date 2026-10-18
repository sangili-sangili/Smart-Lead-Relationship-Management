const mongoose = require('mongoose');
const { LEAD_STATUS } = require('../constants/statusEnums');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      required: [true, 'Lead status is required'],
      enum: {
        values: Object.values(LEAD_STATUS),
        message: '{VALUE} is not a valid lead status'
      },
      default: LEAD_STATUS.NEW
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
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

// Performance & Filtering Indexes (ESR: Equality, Sort, Range)
leadSchema.index({ isDeleted: 1, status: 1, createdAt: -1, _id: -1 });
leadSchema.index({ isDeleted: 1, assignedTo: 1, createdAt: -1, _id: -1 });
leadSchema.index({ company: 1, isDeleted: 1 });
leadSchema.index({ isDeleted: 1, company: 1 });
leadSchema.index({ isDeleted: 1, name: 'text', email: 'text' });
leadSchema.index({ createdAt: -1, _id: -1 });

// Safe Soft-Delete Query Filtering:
// Automatically filters out soft-deleted leads unless explicitly requested via { includeDeleted: true }
leadSchema.pre(/^find|countDocuments/, function (next) {
  const filter = this.getFilter();
  if (filter && filter.includeDeleted) {
    delete filter.includeDeleted;
  } else {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Soft Delete instance method
leadSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore soft-deleted lead method
leadSchema.methods.restore = function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
