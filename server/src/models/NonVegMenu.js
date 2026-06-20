const mongoose = require('mongoose');

const nonVegMenuSchema = new mongoose.Schema({
  messId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessHall',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    required: true,
  },
  items: [{
    name: { type: String, required: true, trim: true },
    cost: { type: Number, required: true, min: 0 },
    icon: { type: String, default: '🍗' },
    isVeg: { type: Boolean, default: false },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

nonVegMenuSchema.index({ messId: 1, date: 1, meal: 1 });

module.exports = mongoose.model('NonVegMenu', nonVegMenuSchema);
