const Finance = require('../models/Finance');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const Member = require('../models/Member');
const { validateTransaction, validateLoan } = require('../utils/validators');
const ExcelJS = require('exceljs');

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Finance.find()
      .populate('member', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id)
      .populate('member', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const { error } = validateTransaction(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'type',
    'amount',
    'description',
    'date',
    'category',
    'paymentMethod',
    'reference',
    'attachments',
    'status'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const transaction = await Finance.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is authorized to update
    if (transaction.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this transaction' });
    }

    // Update transaction
    updates.forEach(update => transaction[update] = req.body[update]);
    await transaction.save();

    // Get member details
    const memberUser = await User.findById(transaction.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, transaction.type, transaction);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: `Transaction Updated`,
        text: `Your ${transaction.type} transaction has been updated.`
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is authorized to delete
    if (transaction.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this transaction' });
    }

    // Check if transaction is already completed
    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'Cannot delete completed transaction' });
    }

    await transaction.remove();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve transaction
const approveTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is authorized to approve
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to approve transactions' });
    }

    // Approve transaction
    await transaction.approve(req.user._id);

    // Get member details
    const memberUser = await User.findById(transaction.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, `${transaction.type}_approved`, transaction);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: `Transaction Approved`,
        text: `Your ${transaction.type} transaction has been approved.`
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get financial statistics
const getStatistics = async (req, res) => {
  try {
    // Get total contributions
    const contributions = await Finance.aggregate([
      {
        $match: {
          type: 'contribution',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total loans
    const loans = await Finance.aggregate([
      {
        $match: {
          type: 'loan',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total expenses
    const expenses = await Finance.aggregate([
      {
        $match: {
          type: 'expense',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly statistics
    const monthlyStats = await Finance.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]);

    res.json({
      contributions: contributions[0] || { total: 0, count: 0 },
      loans: loans[0] || { total: 0, count: 0 },
      expenses: expenses[0] || { total: 0, count: 0 },
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all loans
const getAllLoans = async (req, res) => {
  try {
    const loans = await Finance.find({ type: 'loan' })
      .populate('member', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ date: -1 });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

// Get loan by ID
const getLoanById = async (req, res) => {
  try {
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' })
      .populate('member', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
};

// Create new loan
const createLoan = async (req, res) => {
  try {
    const { error } = validateLoan(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

// Update loan
const updateLoan = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'amount',
    'description',
    'date',
    'paymentMethod',
    'reference',
    'attachments',
    'repaymentSchedule',
    'status'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Check if user is authorized to update
    if (loan.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this loan' });
    }

    updates.forEach(update => loan[update] = req.body[update]);
    await loan.save();

    // Get member details
    const memberUser = await User.findById(loan.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, 'loan_updated', loan);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: 'Loan Updated',
        text: 'Your loan request has been updated.'
      });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(400).json({ error: 'Failed to update loan' });
  }
};

// Delete loan
const deleteLoan = async (req, res) => {
  try {
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Check if user is authorized to delete
    if (loan.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this loan' });
    }

    // Check if loan is already approved
    if (loan.status === 'approved') {
      return res.status(400).json({ error: 'Cannot delete approved loan' });
    }

    await loan.remove();
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
};

// Approve loan
const approveLoan = async (req, res) => {
  try {
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Check if user is authorized to approve
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to approve loans' });
    }

    await loan.approve(req.user._id);

    // Get member details
    const memberUser = await User.findById(loan.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, 'loan_approved', loan);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: 'Loan Approved',
        text: 'Your loan request has been approved.'
      });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error approving loan:', error);
    res.status(400).json({ error: 'Failed to approve loan' });
  }
};

// Reject loan
const rejectLoan = async (req, res) => {
  try {
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Check if user is authorized to reject
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to reject loans' });
    }

    loan.status = 'rejected';
    loan.rejectedBy = req.user._id;
    loan.rejectedAt = new Date();
    await loan.save();

    // Get member details
    const memberUser = await User.findById(loan.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, 'loan_rejected', loan);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: 'Loan Rejected',
        text: 'Your loan request has been rejected.'
      });
    }

    res.json(loan);
  } catch (error) {
    console.error('Error rejecting loan:', error);
    res.status(400).json({ error: 'Failed to reject loan' });
  }
};

// Repay loan
const repayLoan = async (req, res) => {
  try {
    const { amount, paymentMethod, reference } = req.body;
    const loan = await Finance.findOne({ _id: req.params.id, type: 'loan' });
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Create repayment transaction
    const repayment = new Finance({
      type: 'repayment',
      amount,
      description: `Repayment for loan ${loan._id}`,
      date: new Date(),
      member: loan.member,
      paymentMethod,
      reference,
      createdBy: req.user._id,
      status: 'completed',
      relatedLoan: loan._id
    });

    await repayment.save();

    // Update loan balance
    loan.balance = (loan.balance || loan.amount) - amount;
    if (loan.balance <= 0) {
      loan.status = 'completed';
    }
    await loan.save();

    // Get member details
    const memberUser = await User.findById(loan.member);
    if (memberUser) {
      // Create notification
      await Notification.createFinanceNotification(memberUser._id, 'loan_repayment', repayment);

      // Send email notification
      await sendEmail({
        to: memberUser.email,
        subject: 'Loan Repayment',
        text: `A repayment of ${amount} has been recorded for your loan.`
      });
    }

    res.json(repayment);
  } catch (error) {
    console.error('Error recording loan repayment:', error);
    res.status(400).json({ error: 'Failed to record loan repayment' });
  }
};

// Get financial report
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Finance.find(query)
      .populate('member', 'firstName lastName')
      .sort({ date: -1 });

    const report = {
      totalContributions: transactions
        .filter(t => t.type === 'contribution')
        .reduce((sum, t) => sum + t.amount, 0),
      totalLoans: transactions
        .filter(t => t.type === 'loan')
        .reduce((sum, t) => sum + t.amount, 0),
      totalRepayments: transactions
        .filter(t => t.type === 'repayment')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      transactions
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
};

// Get transaction report
const getTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      query.type = type;
    }

    const transactions = await Finance.find(query)
      .populate('member', 'firstName lastName')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Error generating transaction report:', error);
    res.status(500).json({ error: 'Failed to generate transaction report' });
  }
};

// Get loan report
const getLoanReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const query = { type: 'loan' };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.status = status;
    }

    const loans = await Finance.find(query)
      .populate('member', 'firstName lastName')
      .sort({ date: -1 });

    const report = {
      totalLoans: loans.reduce((sum, loan) => sum + loan.amount, 0),
      totalBalance: loans.reduce((sum, loan) => sum + (loan.balance || loan.amount), 0),
      loans
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating loan report:', error);
    res.status(500).json({ error: 'Failed to generate loan report' });
  }
};

// Report Controllers
exports.getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [transactions, loans] = await Promise.all([
      Transaction.find(query).populate('member', 'firstName lastName'),
      Loan.find(query).populate('member', 'firstName lastName')
    ]);

    const reports = {
      totalContributions: transactions
        .filter(t => t.type === 'contribution' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      totalLoans: loans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.amount, 0),
      activeLoans: loans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.balance, 0),
      netBalance: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => {
          if (t.type === 'contribution') return sum + t.amount;
          if (t.type === 'expense') return sum - t.amount;
          return sum;
        }, 0)
    };

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error generating reports', error: error.message });
  }
};

exports.exportReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [transactions, loans] = await Promise.all([
      Transaction.find(query).populate('member', 'firstName lastName'),
      Loan.find(query).populate('member', 'firstName lastName')
    ]);

    // Generate Excel report
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Financial Report');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Member', key: 'member', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Add transactions
    transactions.forEach(transaction => {
      worksheet.addRow({
        date: transaction.date,
        type: transaction.type,
        member: `${transaction.member.firstName} ${transaction.member.lastName}`,
        amount: transaction.amount,
        status: transaction.status
      });
    });

    // Add loans
    loans.forEach(loan => {
      worksheet.addRow({
        date: loan.startDate,
        type: 'Loan',
        member: `${loan.member.firstName} ${loan.member.lastName}`,
        amount: loan.amount,
        status: loan.status
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error exporting reports', error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  getStatistics,
  getAllLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  approveLoan,
  rejectLoan,
  repayLoan,
  getFinancialReport,
  getTransactionReport,
  getLoanReport,
  getReports,
  exportReports
};
