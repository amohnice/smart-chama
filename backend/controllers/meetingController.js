const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendMeetingInvitation } = require('../utils/email');
const { validateObjectId } = require('../utils/validators');

// Get all meetings
const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate('createdBy', 'firstName lastName')
      .populate('attendees', 'firstName lastName')
      .sort({ date: 1 });
    
    // Return empty array if no meetings found
    res.json(meetings || []);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Error fetching meetings', error: error.message });
  }
};

// Get a single meeting
const getMeeting = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('attendees', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meeting', error: error.message });
  }
};

// Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const meeting = new Meeting({
      ...req.body,
      createdBy: req.user._id
    });

    await meeting.save();
    await meeting.populate('createdBy', 'firstName lastName');
    await meeting.populate('attendees', 'firstName lastName');

    // Send notifications to attendees
    const attendeeUsers = await User.find({ _id: { $in: meeting.attendees } });
    for (const user of attendeeUsers) {
      // Create notification
      await Notification.createMeetingNotification(user._id, 'meeting_invitation', meeting);

      // Send email
      await sendMeetingInvitation(user, meeting);
    }

    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error creating meeting', error: error.message });
  }
};

// Update a meeting
const updateMeeting = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only allow updates if user is the creator or an admin
    if (meeting.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    Object.assign(meeting, req.body);
    await meeting.save();
    await meeting.populate('createdBy', 'firstName lastName');
    await meeting.populate('attendees', 'firstName lastName');

    // Notify all attendees of update
    const attendees = await User.find({ _id: { $in: meeting.attendees } });
    for (const user of attendees) {
      await Notification.createMeetingNotification(user._id, 'meeting_update', meeting);
    }

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error updating meeting', error: error.message });
  }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid meeting ID' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only allow deletion if user is the creator or an admin
    if (meeting.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }

    // Notify attendees
    const attendees = await User.find({ _id: { $in: meeting.attendees } });
    for (const user of attendees) {
      await Notification.createMeetingNotification(user._id, 'meeting_cancelled', meeting);
    }

    await meeting.remove();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting', error: error.message });
  }
};

// Add attendee to meeting
const addAttendee = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id) || !validateObjectId(req.body.memberId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    await meeting.addAttendee(req.body.memberId);
    await meeting.populate('attendees', 'firstName lastName');

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error adding attendee', error: error.message });
  }
};

// Remove attendee from meeting
const removeAttendee = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id) || !validateObjectId(req.params.memberId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    await meeting.removeAttendee(req.params.memberId);
    await meeting.populate('attendees', 'firstName lastName');

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ message: 'Error removing attendee', error: error.message });
  }
};

// Get upcoming meetings
const getUpcomingMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      date: { $gte: new Date() },
      status: 'scheduled'
    })
      .populate('createdBy', 'firstName lastName')
      .populate('attendees', 'firstName lastName')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming meetings', error: error.message });
  }
};

// Get past meetings
const getPastMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      date: { $lt: new Date() },
      status: 'completed'
    })
      .populate('attendees', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: -1, startTime: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update meeting status
const updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if user is authorized to update status
    if (meeting.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this meeting' });
    }

    meeting.status = status;
    await meeting.save();

    // Notify attendees of status change
    const attendees = await User.find({ _id: { $in: meeting.attendees } });
    for (const user of attendees) {
      await Notification.createMeetingNotification(user._id, 'meeting_update', meeting);
    }

    res.json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  addAttendee,
  removeAttendee,
  getUpcomingMeetings,
  getPastMeetings,
  updateMeetingStatus
}; 