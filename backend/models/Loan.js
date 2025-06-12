const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
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
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  monthlyPayment: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  repayments: [{
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
      default: 'completed'
    }
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    required: true
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
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
loanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate balance before saving
loanSchema.pre('save', function(next) {
  if (this.isModified('totalPaid') || this.isModified('totalAmount')) {
    this.balance = this.totalAmount - (this.totalPaid || 0);
  }
  next();
});

// Virtual for remaining payments
loanSchema.virtual('remainingPayments').get(function() {
  return Math.ceil(this.balance / this.monthlyPayment);
});

// Virtual for next payment due date
loanSchema.virtual('nextPaymentDue').get(function() {
  if (this.status !== 'approved') return null;
  
  const lastPayment = this.repayments
    .filter(r => r.status === 'completed')
    .sort((a, b) => b.date - a.date)[0];
  
  if (!lastPayment) return this.approvedAt;
  
  const nextDue = new Date(lastPayment.date);
  nextDue.setMonth(nextDue.getMonth() + 1);
  return nextDue;
});

// Method to check if loan is overdue
loanSchema.methods.isOverdue = function() {
  if (this.status !== 'approved') return false;
  
  const nextDue = this.nextPaymentDue;
  if (!nextDue) return false;
  
  return nextDue < new Date();
};

// Create indexes for better query performance
loanSchema.index({ member: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ createdAt: -1 });

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan; 