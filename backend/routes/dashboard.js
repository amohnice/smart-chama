const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', auth, authorize(['admin']), dashboardController.getDashboardStats);

// Get recent members
router.get('/members/recent', auth, authorize(['admin']), dashboardController.getRecentMembers);

// Get recent transactions
router.get('/transactions/recent', auth, authorize(['admin']), dashboardController.getRecentTransactions);

module.exports = router; 