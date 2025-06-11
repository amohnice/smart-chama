const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['contribution', 'loan', 'expense'],
    required: true
  },
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
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'bank', 'cash'],
    default: 'mpesa'
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ member: 1, date: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema); 