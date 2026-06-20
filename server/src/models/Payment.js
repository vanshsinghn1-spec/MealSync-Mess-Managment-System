const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    cost: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1 },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

paymentSchema.index({ messId: 1, date: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
