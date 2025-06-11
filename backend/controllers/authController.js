const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: 'member', // Default role
      status: 'pending' // Default status
    });

    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    user.emailVerificationToken = verificationToken;
    await user.save();

    // Try to send welcome and verification emails, but don't fail if they don't send
    try {
      await sendWelcomeEmail(user.email, user.firstName);
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send welcome/verification emails:', emailError);
      // Continue with registration even if email fails
    }

    // Generate auth token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.getPublicProfile(),
      message: 'Registration successful. Please wait for admin approval to access your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(403).json({ error: 'Account is locked. Please try again later.' });
    }

    // Check if account is pending approval
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin approval.' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Check if account is inactive
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is inactive. Please contact support.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user:', req.user);
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    res.json(req.user.getPublicProfile());
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get current user' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'gender', 'occupation', 'emergencyContact', 'bankDetails', 'preferences'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json(req.user.getPublicProfile());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    // TODO: Implement sendPasswordResetEmail

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: 'Password reset token has expired' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Log the logout
    await req.user.logAudit('logout', {
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ message: 'Logged out successfully' });
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

    // Update user's profile picture
    req.user.profilePicture = req.file.path;
    await req.user.save();

    res.json({
      profileImage: req.user.profilePicture,
      message: 'Profile image updated successfully'
    });
  } catch (error) {
    console.error('Profile image update error:', error);
    res.status(500).json({ error: 'Failed to update profile image' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  updateProfileImage
};
