const mongoose = require('mongoose');

/**
 * Contribution Schema
 * Represents a member's contribution to the chama
 */
const contributionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['regular', 'special', 'loan_repayment'],
    default: 'regular'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
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

// Indexes
contributionSchema.index({ member: 1, date: -1 });
contributionSchema.index({ status: 1 });

const Contribution = mongoose.model('Contribution', contributionSchema);

module.exports = Contribution; 