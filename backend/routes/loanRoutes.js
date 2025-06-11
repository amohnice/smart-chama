const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

/**
 * Get all loans
 * GET /api/loans
 */
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('member', 'name')
      .sort({ startDate: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get active loans count
 * GET /api/loans/active
 */
router.get('/active', async (req, res) => {
  try {
    const count = await Loan.countDocuments({ status: 'Active' });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Add new loan
 * POST /api/loans
 */
router.post('/', async (req, res) => {
  const loan = new Loan({
    member: req.body.memberId,
    amount: req.body.amount,
    interestRate: req.body.interestRate,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    paymentSchedule: req.body.paymentSchedule,
    notes: req.body.notes
  });

  try {
    const newLoan = await loan.save();
    res.status(201).json(newLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update loan status
 * PATCH /api/loans/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    loan.status = req.body.status;
    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 