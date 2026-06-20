const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
    foodItem: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },
  }],
  overallComment: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

// Prevent duplicate feedback per student per meal per day
feedbackSchema.index({ studentId: 1, date: 1, meal: 1, messId: 1 }, { unique: true });
feedbackSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
