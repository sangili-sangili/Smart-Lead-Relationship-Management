const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      maxlength: [120, 'Company name cannot exceed 120 characters']
    },
    industry: {
      type: String,
      trim: true,
      default: 'Technology'
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
    toObject: { virtuals: true }
  }
);

// Indexes
companySchema.index({ industry: 1, createdAt: -1, _id: -1 });
companySchema.index({ createdAt: -1, _id: -1 });

// Virtual relationship to Lead model
companySchema.virtual('leads', {
  ref: 'Lead',
  localField: '_id',
  foreignField: 'company',
  justOne: false,
  match: { isDeleted: false }
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
