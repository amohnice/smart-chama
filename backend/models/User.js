const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: [
      {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: 'Phone number must be 10 digits'
      }
    ]
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'inactive'],
    default: 'pending'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  occupation: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branch: String
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      enum: ['en', 'sw'],
      default: 'en'
    }
  },
  auditLog: [{
    action: String,
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
  profilePicture: {
    type: String
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    meetingReminders: {
      type: Boolean,
      default: true
    },
    contributionReminders: {
      type: Boolean,
      default: true
    },
    loanUpdates: {
      type: Boolean,
      default: true
    },
    systemAnnouncements: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.auditLog;
  return user;
};

// Find user by email
userSchema.statics.findByEmail = async function(email) {
  return this.findOne({ email }).select('+password');
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  
  await this.save();
};

// Log audit trail
userSchema.methods.logAudit = async function(action, details = {}) {
  this.auditLog.push({
    action,
    details: {
      ...details,
      timestamp: new Date()
    }
  });
  await this.save();
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.auditLog;
  return user;
};

// Find user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
