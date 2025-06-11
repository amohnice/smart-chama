const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'emergency', 'annual'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agenda: [{
    title: String,
    description: String,
    duration: Number
  }],
  minutes: {
    type: String
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
meetingSchema.index({ date: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ type: 1 });

// Virtual for checking if meeting is upcoming
meetingSchema.virtual('isUpcoming').get(function() {
  return this.date > new Date() && this.status === 'scheduled';
});

// Virtual for checking if meeting is past
meetingSchema.virtual('isPast').get(function() {
  return this.date < new Date() || this.status === 'completed';
});

// Method to check if a user is an attendee
meetingSchema.methods.isAttendee = function(userId) {
  return this.attendees.some(attendee => 
    attendee.toString() === userId.toString()
  );
};

// Method to add an attendee
meetingSchema.methods.addAttendee = async function(memberId) {
  const meeting = this;
  const isAttendee = meeting.attendees.some(attendee => 
    attendee.toString() === memberId.toString()
  );

  if (!isAttendee) {
    meeting.attendees.push(memberId);
    await meeting.save();
  }

  return meeting;
};

// Method to update attendee status
meetingSchema.methods.updateAttendeeStatus = async function(memberId, status) {
  const meeting = this;
  const index = meeting.attendees.findIndex(attendee => 
    attendee.toString() === memberId.toString()
  );

  if (index !== -1) {
    meeting.attendees[index] = memberId;
    await meeting.save();
  }

  return meeting;
};

// Method to remove an attendee
meetingSchema.methods.removeAttendee = async function(userId) {
  this.attendees = this.attendees.filter(attendee => 
    attendee.toString() !== userId.toString()
  );
  await this.save();
};

// Method to update meeting status
meetingSchema.methods.updateStatus = async function(status) {
  const meeting = this;
  meeting.status = status;
  await meeting.save();
  return meeting;
};

// Method to add agenda item
meetingSchema.methods.addAgendaItem = async function(agendaItem) {
  const meeting = this;
  meeting.agenda.push(agendaItem);
  await meeting.save();
  return meeting;
};

// Method to add attachment
meetingSchema.methods.addAttachment = async function(attachment) {
  const meeting = this;
  meeting.attachments.push(attachment);
  await meeting.save();
  return meeting;
};

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting; 