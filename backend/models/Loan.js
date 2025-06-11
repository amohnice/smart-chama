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
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'defaulted'],
    default: 'pending'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  nextPayment: {
    type: Number,
    default: 0
  },
  nextPaymentDate: {
    type: Date
  },
  guarantors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
loanSchema.index({ member: 1, status: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ nextPaymentDate: 1 });

// Calculate total amount with interest
loanSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.amount * this.interestRate / 100);
});

// Calculate remaining amount
loanSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.paidAmount;
});

// Calculate monthly payment
loanSchema.virtual('monthlyPayment').get(function() {
  return this.totalAmount / this.duration;
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan; 