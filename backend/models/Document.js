const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['meeting', 'financial', 'policy', 'other'],
    default: 'other'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
documentSchema.index({ title: 'text', description: 'text' });
documentSchema.index({ category: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ uploadedBy: 1 });

// Add static method to get documents by category
documentSchema.statics.getByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Add static method to get public documents
documentSchema.statics.getPublic = function() {
  return this.find({ isPublic: true, status: 'active' });
};

// Add static method to get user's documents
documentSchema.statics.getByUser = function(userId) {
  return this.find({ uploadedBy: userId, status: 'active' });
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 