const mongoose = require('mongoose');

const wasteRecordSchema = new mongoose.Schema({
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
  floor: {
    type: String,
    trim: true,
  },
  items: [{
    foodItem: { type: String, required: true },
    leftoverAmount: { type: String, required: true },
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

wasteRecordSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('WasteRecord', wasteRecordSchema);
