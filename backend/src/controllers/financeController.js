const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const User = require('../models/User');
const { validateTransaction, validateLoan } = require('../utils/validators');
const ExcelJS = require('exceljs');

// Transaction Controllers
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('member', 'firstName lastName email')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
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

// Loan Controllers
exports.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('member', 'firstName lastName email')
      .sort({ date: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
};

exports.createLoan = async (req, res) => {
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