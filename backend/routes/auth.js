const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/logout', auth, logout);

module.exports = router; 