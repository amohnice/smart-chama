const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['contribution', 'loan', 'expense', 'interest', 'fine'],
    required: [true, 'Transaction type is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'mobile_money', 'check'],
    required: [true, 'Payment method is required']
  },
  reference: {
    type: String,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  // Loan specific fields
  loanDetails: {
    interestRate: Number,
    term: Number, // in months
    startDate: Date,
    endDate: Date,
    paymentSchedule: [{
      dueDate: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      paidAt: Date
    }]
  },
  // Fine specific fields
  fineDetails: {
    reason: String,
    dueDate: Date,
    gracePeriod: Number // in days
  }
}, {
  timestamps: true
});

// Index for efficient querying
financeSchema.index({ date: 1, type: 1, status: 1 });
financeSchema.index({ member: 1, type: 1 });

// Method to get total contributions for a member
financeSchema.statics.getMemberContributions = async function(memberId) {
  return this.aggregate([
    {
      $match: {
        member: mongoose.Types.ObjectId(memberId),
        type: 'contribution',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Method to get total loans for a member
financeSchema.statics.getMemberLoans = async function(memberId) {
  return this.aggregate([
    {
      $match: {
        member: mongoose.Types.ObjectId(memberId),
        type: 'loan',
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Method to get total expenses
financeSchema.statics.getTotalExpenses = async function(startDate, endDate) {
  const match = {
    type: 'expense',
    status: 'completed'
  };

  if (startDate && endDate) {
    match.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
};

// Approve transaction
financeSchema.methods.approve = async function(approverId) {
  const transaction = this;
  transaction.status = 'approved';
  transaction.approvedBy = approverId;
  transaction.approvedAt = new Date();
  await transaction.save();
  return transaction;
};

// Reject transaction
financeSchema.methods.reject = async function(approverId, reason) {
  const transaction = this;
  transaction.status = 'rejected';
  transaction.approvedBy = approverId;
  transaction.approvedAt = new Date();
  transaction.rejectionReason = reason;
  await transaction.save();
  return transaction;
};

// Complete transaction
financeSchema.methods.complete = async function() {
  const transaction = this;
  transaction.status = 'completed';
  await transaction.save();
  return transaction;
};

// Add attachment
financeSchema.methods.addAttachment = async function(attachment) {
  const transaction = this;
  transaction.attachments.push(attachment);
  await transaction.save();
  return transaction;
};

// Update loan payment
financeSchema.methods.updateLoanPayment = async function(paymentIndex, status) {
  const transaction = this;
  if (transaction.type === 'loan' && transaction.loanDetails.paymentSchedule[paymentIndex]) {
    transaction.loanDetails.paymentSchedule[paymentIndex].status = status;
    if (status === 'paid') {
      transaction.loanDetails.paymentSchedule[paymentIndex].paidAt = new Date();
    }
    await transaction.save();
  }
  return transaction;
};

// Calculate loan interest
financeSchema.methods.calculateLoanInterest = function() {
  if (this.type === 'loan' && this.loanDetails) {
    const principal = this.amount;
    const rate = this.loanDetails.interestRate / 100;
    const term = this.loanDetails.term;
    return principal * rate * term;
  }
  return 0;
};

// Calculate total loan amount
financeSchema.methods.calculateTotalLoanAmount = function() {
  if (this.type === 'loan') {
    return this.amount + this.calculateLoanInterest();
  }
  return this.amount;
};

const Finance = mongoose.model('Finance', financeSchema);

module.exports = Finance; 