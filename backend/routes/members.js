const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberStatistics,
  getMemberTransactions,
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getDashboardStats,
  getRecentTransactions,
  getUpcomingMeetings,
  getActiveLoan,
  getContributions,
  getContributionHistory,
  makeContribution,
  getLoans,
  applyForLoan,
  getStatements,
  getDocuments,
  getDocument,
  getSettings,
  updateSettings
} = require('../controllers/memberController');

// All routes require authentication
router.use(auth);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/profile/image', updateProfileImage);
router.put('/profile/password', changePassword);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/transactions/recent', getRecentTransactions);
router.get('/meetings/upcoming', getUpcomingMeetings);
router.get('/loans/active', getActiveLoan);

// Finance routes
router.get('/contributions', getContributions);
router.get('/contributions/history', getContributionHistory);
router.post('/contributions', makeContribution);
router.get('/loans', getLoans);
router.post('/loans/apply', applyForLoan);
router.get('/statements', getStatements);

// Document routes
router.get('/documents', getDocuments);
router.get('/documents/:id', getDocument);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Admin routes
router.use(admin);
router.get('/', getAllMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.get('/:id/statistics', getMemberStatistics);
router.get('/:id/transactions', getMemberTransactions);

module.exports = router; 