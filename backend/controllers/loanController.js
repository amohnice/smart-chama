const Loan = require('../models/Loan');
const Member = require('../models/Member');
const { validateObjectId } = require('../utils/validators');

// Get all loans
async function getAllLoans(req, res) {
  try {
    const loans = await Loan.find()
      .populate('member', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
}

// Get loan by ID
async function getLoanById(req, res) {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id)
      .populate('member', 'firstName lastName email')
      .populate('repayments');
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loan', error: error.message });
  }
}

// Create new loan
async function createLoan(req, res) {
  try {
    const { member, amount, purpose, duration, interestRate } = req.body;

    // Validate member ID
    if (!validateObjectId(member)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    // Check if member exists
    const memberExists = await Member.findById(member);
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Calculate total amount with interest
    const totalAmount = amount + (amount * (interestRate / 100));
    const monthlyPayment = totalAmount / duration;

    const loan = new Loan({
      member,
      amount,
      purpose,
      duration,
      interestRate,
      totalAmount,
      monthlyPayment,
      balance: totalAmount,
      status: 'pending'
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
}

// Apply for loan
async function applyForLoan(req, res) {
  try {
    const { amount, purpose, duration } = req.body;
    const memberId = req.user._id;

    // Calculate interest rate (you can adjust this based on your business logic)
    const interestRate = 10; // 10% interest rate
    const totalAmount = amount + (amount * (interestRate / 100));
    const monthlyPayment = totalAmount / duration;

    const loan = new Loan({
      member: memberId,
      amount,
      purpose,
      duration,
      interestRate,
      totalAmount,
      monthlyPayment,
      balance: totalAmount,
      status: 'pending'
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error applying for loan', error: error.message });
  }
}

// Approve loan
async function approveLoan(req, res) {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Loan is not in pending status' });
    }

    loan.status = 'approved';
    loan.approvedAt = new Date();
    loan.approvedBy = req.user._id;

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error approving loan', error: error.message });
  }
}

// Reject loan
async function rejectLoan(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Loan is not in pending status' });
    }

    loan.status = 'rejected';
    loan.rejectionReason = reason;
    loan.rejectedAt = new Date();
    loan.rejectedBy = req.user._id;

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting loan', error: error.message });
  }
}

// Repay loan
async function repayLoan(req, res) {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ message: 'Loan is not approved' });
    }

    const repayment = {
      amount,
      date: new Date(),
      status: 'completed'
    };

    loan.repayments.push(repayment);
    loan.totalPaid = (loan.totalPaid || 0) + amount;
    loan.balance = loan.totalAmount - loan.totalPaid;

    if (loan.balance <= 0) {
      loan.status = 'completed';
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error repaying loan', error: error.message });
  }
}

// Update loan
async function updateLoan(req, res) {
  try {
    const { id } = req.params;
    const { amount, purpose, duration, interestRate } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending loans' });
    }

    // Recalculate total amount and monthly payment if amount or interest rate changes
    if (amount || interestRate) {
      const newAmount = amount || loan.amount;
      const newInterestRate = interestRate || loan.interestRate;
      const newTotalAmount = newAmount + (newAmount * (newInterestRate / 100));
      const newMonthlyPayment = newTotalAmount / (duration || loan.duration);

      loan.amount = newAmount;
      loan.interestRate = newInterestRate;
      loan.totalAmount = newTotalAmount;
      loan.monthlyPayment = newMonthlyPayment;
      loan.balance = newTotalAmount;
    }

    if (purpose) loan.purpose = purpose;
    if (duration) loan.duration = duration;

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating loan', error: error.message });
  }
}

// Delete loan
async function deleteLoan(req, res) {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid loan ID' });
    }

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending loans' });
    }

    await loan.deleteOne();
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
}

// Get member's loans
async function getMemberLoans(req, res) {
  try {
    const loans = await Loan.find({ member: req.user._id })
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching member loans', error: error.message });
  }
}

// Get loan statistics
async function getLoanStats(req, res) {
  try {
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'approved' });
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    const totalAmount = await Loan.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalLoans,
      activeLoans,
      pendingLoans,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loan statistics', error: error.message });
  }
}

// Export loans
async function exportLoans(req, res) {
  try {
    const loans = await Loan.find()
      .populate('member', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // TODO: Implement Excel/CSV export logic
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting loans', error: error.message });
  }
}

module.exports = {
  getAllLoans,
  getLoanById,
  createLoan,
  applyForLoan,
  approveLoan,
  rejectLoan,
  repayLoan,
  updateLoan,
  deleteLoan,
  getMemberLoans,
  getLoanStats,
  exportLoans
};
