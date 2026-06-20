const mongoose = require('mongoose');

const featureToggleSchema = new mongoose.Schema({
  featureName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isEnabled: {
    type: Boolean,
    default: false,
  },
  enabledAt: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeatureToggle', featureToggleSchema);
