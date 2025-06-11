const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');
const Meeting = require('../models/Meeting');

/**
 * Get dashboard statistics
 * GET /api/finance/statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    // Get total members count
    const totalMembers = await User.countDocuments({ role: 'member' });
    
    // Get active members count
    const activeMembers = await User.countDocuments({ 
      role: 'member', 
      status: 'Active' 
    });

    // Get total contributions
    const totalContributions = await Contribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get active loans count
    const activeLoans = await Loan.countDocuments({ status: 'Active' });

    // Get next meeting
    const nextMeeting = await Meeting.findOne({
      date: { $gte: new Date() },
      status: 'Scheduled'
    }).sort({ date: 1 });

    res.json({
      totalMembers,
      activeMembers,
      totalContributions: totalContributions[0]?.total || 0,
      activeLoans,
      nextMeeting: nextMeeting ? {
        title: nextMeeting.title,
        date: nextMeeting.date,
        location: nextMeeting.location
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
