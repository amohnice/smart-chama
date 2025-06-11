const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
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
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  monthlyPayment: {
    type: Number,
    required: true,
    min: 0
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0
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
    reference: String
  }],
  guarantors: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
loanSchema.index({ member: 1, status: 1 });
loanSchema.index({ status: 1, endDate: 1 });
loanSchema.index({ startDate: -1 });

module.exports = mongoose.models.Loan || mongoose.model('Loan', loanSchema); 