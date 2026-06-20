const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'mess_official', 'admin'],
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    sparse: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessHall',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: String,
  lastLogin: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: Date,
}, {
  timestamps: true,
});

// Index for fast lookups
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ rollNumber: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// Exclude sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
