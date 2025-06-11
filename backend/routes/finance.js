const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const financeController = require('../src/controllers/financeController');

// Transaction routes
router.get('/transactions', auth, admin, financeController.getTransactions);
router.post('/transactions', auth, admin, financeController.createTransaction);

// Loan routes
router.get('/loans', auth, admin, financeController.getLoans);
router.post('/loans', auth, admin, financeController.createLoan);

// Report routes
router.get('/reports', auth, admin, financeController.getReports);
router.get('/reports/export', auth, admin, financeController.exportReports);

module.exports = router; 