const mongoose = require('mongoose');

/**
 * Contribution Schema
 * Represents a member's contribution to the chama
 */
const contributionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['regular', 'special', 'emergency'],
    default: 'regular'
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  date: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_money'],
    required: true
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
contributionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
contributionSchema.index({ member: 1 });
contributionSchema.index({ date: -1 });
contributionSchema.index({ status: 1 });

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution; 