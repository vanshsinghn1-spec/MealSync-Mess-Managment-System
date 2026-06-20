const express = require('express');
const Notification = require('../models/Notification');
const MessSwitchRequest = require('../models/MessSwitchRequest');
const FeatureToggle = require('../models/FeatureToggle');
const WasteRecord = require('../models/WasteRecord');
const MessHall = require('../models/MessHall');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getISTDate } = require('../utils/timeUtils');

const router = express.Router();

// GET /api/messes — List all mess halls
router.get('/messes', async (req, res, next) => {
  try {
    const messes = await MessHall.find({ isActive: true });
    res.json(messes);
  } catch (error) {
    next(error);
  }
});

// POST /api/waste — Log food waste (mess_official / admin)
router.post('/waste', authenticate, roleGuard('mess_official', 'admin'), async (req, res, next) => {
  try {
    const { messId, meal, items } = req.body;

    if (!messId || !meal || !items || !items.length) {
      return res.status(400).json({ error: 'messId, meal, and items are required' });
    }

    const today = getISTDate();
    const record = new WasteRecord({
      messId,
      date: today,
      meal,
      items,
      createdBy: req.user._id,
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications — Get notifications for current user
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const role = req.user.role;
    const recipientTypes = ['all'];
    if (role === 'student') recipientTypes.push('students');
    if (role === 'mess_official') recipientTypes.push('mess_officials');

    const notifications = await Notification.find({
      recipientType: { $in: recipientTypes },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

// POST /api/mess-switch — Submit mess switch request (student)
router.post('/mess-switch', authenticate, roleGuard('student'), async (req, res, next) => {
  try {
    const { toMess, reason } = req.body;

    if (!toMess) {
      return res.status(400).json({ error: 'Target mess is required' });
    }

    // Check if switching is enabled
    const toggle = await FeatureToggle.findOne({ featureName: 'mess_switching' });
    if (!toggle || !toggle.isEnabled) {
      return res.status(403).json({ error: 'Mess switching is currently disabled' });
    }

    // Check for existing pending request
    const existing = await MessSwitchRequest.findOne({
      studentId: req.user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ error: 'You already have a pending switch request' });
    }

    const request = new MessSwitchRequest({
      studentId: req.user._id,
      fromMess: req.user.messId,
      toMess,
      reason,
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

// GET /api/mess-switch/my — Student's switch requests
router.get('/mess-switch/my', authenticate, async (req, res, next) => {
  try {
    const requests = await MessSwitchRequest.find({ studentId: req.user._id })
      .populate('fromMess', 'name')
      .populate('toMess', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// GET /api/mess-switch/status — Check if switching is enabled
router.get('/mess-switch/status', async (req, res, next) => {
  try {
    const toggle = await FeatureToggle.findOne({ featureName: 'mess_switching' });
    res.json({ isEnabled: toggle ? toggle.isEnabled : false });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
