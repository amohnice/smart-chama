const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: [
      'meeting_invitation',
      'meeting_reminder',
      'meeting_cancelled',
      'meeting_updated',
      'contribution_due',
      'contribution_received',
      'loan_request',
      'loan_approved',
      'loan_rejected',
      'loan_payment_due',
      'loan_payment_received',
      'fine_issued',
      'fine_paid',
      'system_announcement'
    ],
    required: [true, 'Type is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Finance'
  },
  systemNotification: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  actionUrl: String,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  const notification = this;
  notification.read = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = async function() {
  this.read = false;
  this.readAt = undefined;
  await this.save();
};

// Static method to create a meeting notification
notificationSchema.statics.createMeetingNotification = async function(recipientId, type, meeting) {
  const notification = new Notification({
    title: `Meeting ${type}`,
    message: `Meeting "${meeting.title}" has been ${type}`,
    type: `meeting_${type}`,
    recipient: recipientId,
    meeting: meeting._id,
    sender: meeting.organizer,
    actionUrl: `/meetings/${meeting._id}`
  });

  await notification.save();
  return notification;
};

// Static method to create a finance notification
notificationSchema.statics.createFinanceNotification = async function(recipientId, type, transaction) {
  const notification = new Notification({
    title: `Transaction ${type}`,
    message: `Your ${transaction.type} transaction of ${transaction.amount} has been ${type}`,
    type: `${transaction.type}_${type}`,
    recipient: recipientId,
    finance: transaction._id,
    sender: transaction.createdBy,
    actionUrl: `/finance/${transaction._id}`
  });

  await notification.save();
  return notification;
};

// Static method to create a system notification
notificationSchema.statics.createSystemNotification = async function(recipientId, title, message, type = 'system_announcement') {
  const notification = new Notification({
    title,
    message,
    type,
    recipient: recipientId,
    systemNotification: true,
    priority: 'high'
  });

  await notification.save();
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
