const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all members
router.get('/members', auth, authorize('admin'), async (req, res) => {
  try {
    const members = await User.find({ role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });

    const formattedMembers = members.map(member => ({
      id: member._id.toString(),
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone || '',
      status: member.status || 'inactive',
      joinedDate: member.createdAt.toLocaleDateString(),
      lastLogin: member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Members fetch error:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
});

// Activate member
router.put('/members/:id/activate', auth, authorize('admin'), async (req, res) => {
  try {
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Member activation error:', error);
    res.status(500).json({ message: 'Error activating member' });
  }
});

// Deactivate member
router.put('/members/:id/deactivate', auth, authorize('admin'), async (req, res) => {
  try {
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Member deactivation error:', error);
    res.status(500).json({ message: 'Error deactivating member' });
  }
});

module.exports = router; 