const mongoose = require('mongoose');

const mealPollSchema = new mongoose.Schema({
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
  vote: {
    type: String,
    enum: ['like', 'dislike'],
    required: true,
  },
}, {
  timestamps: true,
});

// One vote per student per meal per day
mealPollSchema.index({ studentId: 1, date: 1, meal: 1, messId: 1 }, { unique: true });
mealPollSchema.index({ messId: 1, date: 1, meal: 1 });

module.exports = mongoose.model('MealPoll', mealPollSchema);
