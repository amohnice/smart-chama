const User = require('../models/User');
const Finance = require('../models/Finance');
const Meeting = require('../models/Meeting');
const { sendEmail } = require('../utils/email');
const mongoose = require('mongoose');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');

// Get all members
const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ firstName: 1, lastName: 1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member by ID
const getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' })
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new member
const createMember = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Check if email already exists
    const existingMember = await User.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new member
    const member = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: 'member'
    });

    await member.save();

    // Send welcome email
    await sendEmail({
      to: member.email,
      subject: 'Welcome to Smart Chama',
      text: `Welcome ${member.firstName}! Your account has been created successfully.`
    });

    res.status(201).json(member.getPublicProfile());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update member
const updateMember = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'phoneNumber', 'status'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    updates.forEach(update => member[update] = req.body[update]);
    await member.save();

    res.json(member.getPublicProfile());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Check if member has any active transactions
    const activeTransactions = await Finance.findOne({
      member: member._id,
      status: 'pending'
    });

    if (activeTransactions) {
      return res.status(400).json({ error: 'Cannot delete member with active transactions' });
    }

    // Soft delete by updating status
    member.status = 'inactive';
    await member.save();

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member statistics
const getMemberStatistics = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get total contributions
    const contributions = await Finance.aggregate([
      {
        $match: {
          member: new mongoose.Types.ObjectId(member._id),
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
          member: new mongoose.Types.ObjectId(member._id),
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

    // Get attendance rate
    const meetings = await Meeting.find({
      'attendees.member': member._id,
      status: 'completed'
    });

    const totalMeetings = await Meeting.countDocuments({ status: 'completed' });
    const attendanceRate = totalMeetings > 0 ? (meetings.length / totalMeetings) * 100 : 0;

    res.json({
      contributions: contributions[0] || { total: 0, count: 0 },
      loans: loans[0] || { total: 0, count: 0 },
      attendanceRate: Math.round(attendanceRate)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member transactions
const getMemberTransactions = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const transactions = await Finance.find({ member: member._id })
      .sort({ date: -1 })
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get member profile
const getProfile = async (req, res) => {
  try {
    const member = await User.findById(req.user._id).select('-password');
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update member profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.firstName = firstName || member.firstName;
    member.lastName = lastName || member.lastName;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.address = address || member.address;

    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile image
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.profileImage = req.file.path;
    await member.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, member.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    member.password = await bcrypt.hash(newPassword, 10);
    await member.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const [totalContributions, activeLoan, upcomingMeetings, pendingDocuments] = await Promise.all([
      Contribution.aggregate([
        { $match: { member: member._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Loan.findOne({ member: member._id, status: 'active' }),
      Meeting.countDocuments({ date: { $gt: new Date() } }),
      Document.countDocuments({ status: 'pending' })
    ]);

    const stats = {
      totalContributions: totalContributions[0]?.total || 0,
      currentBalance: member.balance || 0,
      activeLoans: activeLoan ? 1 : 0,
      upcomingMeetings: upcomingMeetings || 0,
      pendingDocuments: pendingDocuments || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent transactions
const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Contribution.find({ member: req.user._id })
      .sort({ date: -1 })
      .limit(10)
      .populate('member', 'firstName lastName');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming meetings
const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      date: { $gt: new Date() }
    })
      .sort({ date: 1 })
      .limit(5);

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active loan
const getActiveLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({
      member: req.user._id,
      status: 'active'
    });

    if (!loan) {
      return res.json(null);
    }

    const loanProgress = {
      totalAmount: loan.amount,
      paidAmount: loan.paidAmount || 0,
      remainingAmount: loan.amount - (loan.paidAmount || 0),
      nextPayment: loan.nextPayment || 0,
      nextPaymentDate: loan.nextPaymentDate
    };

    res.json(loanProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contributions
const getContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.user._id })
      .sort({ date: -1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contribution history
const getContributionHistory = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.user._id })
      .sort({ date: -1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Make contribution
const makeContribution = async (req, res) => {
  try {
    const { amount, type, description, paymentMethod } = req.body;
    const contribution = new Contribution({
      member: req.user._id,
      amount,
      type,
      description,
      paymentMethod,
      date: new Date(),
      status: 'pending'
    });

    await contribution.save();
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get loans
const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.user._id })
      .sort({ date: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply for loan
const applyForLoan = async (req, res) => {
  try {
    const { amount, purpose, duration, interestRate } = req.body;
    const loan = new Loan({
      member: req.user._id,
      amount,
      purpose,
      duration,
      interestRate,
      status: 'pending',
      date: new Date()
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get statements
const getStatements = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { member: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const contributions = await Contribution.find(query)
      .sort({ date: -1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get documents
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ status: 'active' })
      .sort({ date: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get document
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get settings
const getSettings = async (req, res) => {
  try {
    const member = await User.findById(req.user._id).select('settings');
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member.settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  try {
    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.settings = { ...member.settings, ...req.body };
    await member.save();
    res.json(member.settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberStatistics,
  getMemberTransactions,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getDashboardStats,
  getRecentTransactions,
  getUpcomingMeetings,
  getActiveLoan,
  getContributions,
  getContributionHistory,
  makeContribution,
  getLoans,
  applyForLoan,
  getStatements,
  getDocuments,
  getDocument,
  getSettings,
  updateSettings
}; 