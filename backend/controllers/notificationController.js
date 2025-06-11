const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'firstName lastName')
      .populate('relatedMeeting', 'title date')
      .populate('relatedFinance', 'type amount');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete all notifications
const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create notification (internal use)
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create meeting notification
const createMeetingNotification = async (meeting, recipients) => {
  try {
    const notifications = recipients.map(recipient => ({
      recipient,
      type: 'meeting',
      title: 'New Meeting Scheduled',
      message: `A new meeting "${meeting.title}" has been scheduled for ${new Date(meeting.date).toLocaleDateString()}`,
      relatedMeeting: meeting._id
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating meeting notifications:', error);
    throw error;
  }
};

// Create contribution notification
const createContributionNotification = async (contribution) => {
  try {
    const notification = new Notification({
      recipient: contribution.member,
      type: 'contribution',
      title: 'Contribution Recorded',
      message: `Your contribution of ${contribution.amount} has been recorded`,
      relatedFinance: contribution._id
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating contribution notification:', error);
    throw error;
  }
};

// Create loan notification
const createLoanNotification = async (loan, status) => {
  try {
    const notification = new Notification({
      recipient: loan.member,
      type: 'loan',
      title: `Loan ${status}`,
      message: `Your loan request for ${loan.amount} has been ${status}`,
      relatedFinance: loan._id
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating loan notification:', error);
    throw error;
  }
};

// Create system notification
const createSystemNotification = async (req, res) => {
  try {
    const { title, message, type, recipients } = req.body;

    // Create notifications for all recipients
    const notifications = await Promise.all(
      recipients.map(async (recipientId) => {
        const notification = new Notification({
          title,
          message,
          type,
          recipient: recipientId,
          sender: req.user._id,
          systemNotification: true
        });

        await notification.save();

        // Get recipient details
        const recipient = await User.findById(recipientId);
        if (recipient) {
          // Send email notification
          await sendEmail({
            to: recipient.email,
            subject: title,
            text: message
          });
        }

        return notification;
      })
    );

    res.status(201).json(notifications);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'email',
    'push',
    'sms',
    'meetingReminders',
    'contributionReminders',
    'loanUpdates',
    'systemAnnouncements'
  ];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user._id);
    updates.forEach(update => user.notificationPreferences[update] = req.body[update]);
    await user.save();

    res.json(user.notificationPreferences);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createSystemNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  createNotification,
  createMeetingNotification,
  createContributionNotification,
  createLoanNotification
};
