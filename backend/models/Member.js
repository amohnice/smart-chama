const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  contributions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contribution'
  }],
  loans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
memberSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
memberSchema.index({ email: 1 });
memberSchema.index({ idNumber: 1 });
memberSchema.index({ status: 1 });

const Member = mongoose.model('Member', memberSchema);

module.exports = Member; 