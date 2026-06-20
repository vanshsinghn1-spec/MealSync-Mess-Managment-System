const mongoose = require('mongoose');

const messSwitchRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromMess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessHall',
    required: true,
  },
  toMess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessHall',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    trim: true,
    default: '',
  },
  adminNote: {
    type: String,
    trim: true,
    default: '',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: Date,
}, {
  timestamps: true,
});

messSwitchRequestSchema.index({ studentId: 1, status: 1 });
messSwitchRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('MessSwitchRequest', messSwitchRequestSchema);
