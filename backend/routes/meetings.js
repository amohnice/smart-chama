const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const {
  getAllMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  addAttendee,
  removeAttendee,
  getUpcomingMeetings,
  getPastMeetings
} = require('../controllers/meetingController');

// Apply auth middleware to all routes
router.use(auth);

// Get all meetings (admin only)
router.get('/', adminAuth, getAllMeetings);

// Get upcoming meetings
router.get('/upcoming', getUpcomingMeetings);

// Get past meetings
router.get('/past', getPastMeetings);

// Get a single meeting
router.get('/:id', getMeeting);

// Create a new meeting (admin only)
router.post('/', adminAuth, createMeeting);

// Update a meeting (admin only)
router.put('/:id', adminAuth, updateMeeting);

// Delete a meeting (admin only)
router.delete('/:id', adminAuth, deleteMeeting);

// Add attendee to meeting (admin only)
router.post('/:id/attendees', adminAuth, addAttendee);

// Remove attendee from meeting (admin only)
router.delete('/:id/attendees/:memberId', adminAuth, removeAttendee);

module.exports = router; 