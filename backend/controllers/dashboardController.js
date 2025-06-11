const User = require('../models/User');
const Finance = require('../models/Finance');
const Document = require('../models/Document');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalMembers,
      totalContributions,
      totalLoans,
      totalDocuments,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      Finance.countDocuments({ type: 'contribution' }),
      Finance.countDocuments({ type: 'loan' }),
      Document.countDocuments(),
    ]);

    res.json({
      totalMembers,
      totalContributions,
      totalLoans,
      totalDocuments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

exports.getRecentMembers = async (req, res) => {
  try {
    const recentMembers = await User.find({ role: 'member' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt status');

    const formattedMembers = recentMembers.map(member => ({
      id: member._id.toString(),
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      joinedDate: member.createdAt.toLocaleDateString(),
      status: member.status || 'inactive'
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Recent members error:', error);
    res.status(500).json({ message: 'Error fetching recent members' });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const recentTransactions = await Finance.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('member', 'firstName lastName');

    const formattedTransactions = recentTransactions.map(transaction => ({
      id: transaction._id.toString(),
      type: transaction.type || 'unknown',
      amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
      date: transaction.date || new Date(),
      status: transaction.status || 'pending',
      member: transaction.member ? {
        firstName: transaction.member.firstName || '',
        lastName: transaction.member.lastName || ''
      } : null
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ message: 'Error fetching recent transactions' });
  }
}; 