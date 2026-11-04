const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  recipientType: {
    type: String,
    enum: ['all', 'students', 'mess_officials'],
    required: true,
  },
  category: {
    type: String,
    enum: ['general', 'sac_update', 'emergency', 'menu_substitution'],
    default: 'general',
  },
  source: {
    type: String,
    enum: ['admin', 'sac_email', 'system'],
    default: 'admin',
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'high'],
    default: 'normal',
  },
  isBanner: {
    type: Boolean,
    default: false,
  },
  bannerActiveUntil: {
    type: Date,
  },
  senderEmail: {
    type: String,
    trim: true,
  },
  rawEmailSubject: {
    type: String,
    trim: true,
  },
  gmailMessageId: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiresAt: {
    type: Date,
    default: null, // Keep indefinitely in announcement archive unless explicitly set
  },
}, {
  timestamps: true,
});

notificationSchema.index({ recipientType: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ isBanner: 1, createdAt: -1 });
notificationSchema.index({ gmailMessageId: 1 }, { sparse: true });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
