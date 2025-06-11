const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -tokens')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -tokens');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'status', 'role'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -tokens');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'address'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ error: 'Failed to change password' });
  }
});

// Update profile image
router.put('/profile/image', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle image upload here
    // For now, we'll just update a placeholder
    user.profilePicture = 'placeholder.jpg';
    await user.save();
    
    res.json({ profileImage: user.profilePicture });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(400).json({ error: 'Failed to update profile image' });
  }
});

module.exports = router;
