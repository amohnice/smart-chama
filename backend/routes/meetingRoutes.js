const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');

/**
 * Get all meetings
 * GET /api/meetings
 */
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('attendees.member', 'name')
      .sort({ date: 1 });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get next meeting
 * GET /api/meetings/next
 */
router.get('/next', async (req, res) => {
  try {
    const nextMeeting = await Meeting.findOne({
      date: { $gte: new Date() },
      status: 'Scheduled'
    }).sort({ date: 1 });
    
    res.json(nextMeeting || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Add new meeting
 * POST /api/meetings
 */
router.post('/', async (req, res) => {
  const meeting = new Meeting({
    title: req.body.title,
    date: req.body.date,
    location: req.body.location,
    type: req.body.type,
    agenda: req.body.agenda,
    attendees: req.body.attendees
  });

  try {
    const newMeeting = await meeting.save();
    res.status(201).json(newMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * Update meeting status
 * PATCH /api/meetings/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    meeting.status = req.body.status;
    if (req.body.minutes) {
      meeting.minutes = req.body.minutes;
    }
    
    const updatedMeeting = await meeting.save();
    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 