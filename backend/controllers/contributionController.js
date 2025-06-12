const Contribution = require('../models/Contribution');
const Member = require('../models/Member');
const { validateObjectId } = require('../utils/validators');

// Get all contributions
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate('member', 'firstName lastName email')
      .sort({ date: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contributions', error: error.message });
  }
};

// Get member's contributions
exports.getMemberContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ member: req.user._id })
      .sort({ date: -1 });
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contributions', error: error.message });
  }
};

// Make a contribution
exports.makeContribution = async (req, res) => {
  try {
    const { amount, type, notes } = req.body;

    const contribution = new Contribution({
      member: req.user._id,
      amount,
      type,
      notes,
      status: 'completed'
    });

    await contribution.save();
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ message: 'Error making contribution', error: error.message });
  }
};

// Add contribution (admin)
exports.addContribution = async (req, res) => {
  try {
    const { member, amount, type, notes } = req.body;

    if (!validateObjectId(member)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const memberExists = await Member.findById(member);
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const contribution = new Contribution({
      member,
      amount,
      type,
      notes,
      status: 'completed',
      addedBy: req.user._id
    });

    await contribution.save();
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ message: 'Error adding contribution', error: error.message });
  }
};

// Update contribution
exports.updateContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, notes, status } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid contribution ID' });
    }

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    contribution.amount = amount;
    contribution.type = type;
    contribution.notes = notes;
    contribution.status = status;
    contribution.updatedBy = req.user._id;

    await contribution.save();
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: 'Error updating contribution', error: error.message });
  }
};

// Delete contribution
exports.deleteContribution = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid contribution ID' });
    }

    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }

    await contribution.remove();
    res.json({ message: 'Contribution deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contribution', error: error.message });
  }
};

// Get contribution statistics
exports.getContributionStats = async (req, res) => {
  try {
    const totalContributions = await Contribution.countDocuments();
    const totalAmount = await Contribution.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyStats = await Contribution.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalContributions,
      totalAmount: totalAmount[0]?.total || 0,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contribution statistics', error: error.message });
  }
};

// Export contributions
exports.exportContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find()
      .populate('member', 'firstName lastName email')
      .sort({ date: -1 });

    // TODO: Implement Excel/CSV export logic
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting contributions', error: error.message });
  }
}; 