const mongoose = require('mongoose');

const vegMenuSchema = new mongoose.Schema({
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessHall',
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  weekType: {
    type: String,
    enum: ['odd', 'even'],
    required: true,
  },
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true,
  },
  items: [{
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '🍽️' },
  }],
}, {
  timestamps: true,
});

// Compound index for fast lookups
vegMenuSchema.index({ messId: 1, day: 1, weekType: 1, meal: 1 });

module.exports = mongoose.model('VegMenu', vegMenuSchema);
