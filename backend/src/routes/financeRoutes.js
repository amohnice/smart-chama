const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Transaction routes
router.get('/transactions', authenticateToken, isAdmin, financeController.getTransactions);
router.post('/transactions', authenticateToken, isAdmin, financeController.createTransaction);

// Loan routes
router.get('/loans', authenticateToken, isAdmin, financeController.getLoans);
router.post('/loans', authenticateToken, isAdmin, financeController.createLoan);

// Report routes
router.get('/reports', authenticateToken, isAdmin, financeController.getReports);
router.get('/reports/export', authenticateToken, isAdmin, financeController.exportReports);

module.exports = router; 