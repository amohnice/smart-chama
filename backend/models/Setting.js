const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'finance', 'meetings', 'notifications', 'security'],
    default: 'general'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes
settingSchema.index({ key: 1 });
settingSchema.index({ category: 1 });

// Add static method to get all settings by category
settingSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

// Add static method to get public settings
settingSchema.statics.getPublic = function() {
  return this.find({ isPublic: true });
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting; 