const express = require('express');
const Notification = require('../models/Notification');
const MessSwitchRequest = require('../models/MessSwitchRequest');
const FeatureToggle = require('../models/FeatureToggle');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const MealPoll = require('../models/MealPoll');
const WasteRecord = require('../models/WasteRecord');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getISTDate } = require('../utils/timeUtils');

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, roleGuard('admin'));

// GET /api/admin/dashboard — Dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalStudents,
      pendingRequests,
      recentFeedback,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      MessSwitchRequest.countDocuments({ status: 'pending' }),
      Feedback.find().sort({ createdAt: -1 }).limit(5).populate('messId', 'name'),
    ]);

    // Avg rating in last 30 days
    const thirtyDaysAgo = new Date(getISTDate());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ratingAgg = await Feedback.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      { $group: { _id: null, avgRating: { $avg: '$items.rating' } } },
    ]);

    const avgRating = ratingAgg.length ? Math.round(ratingAgg[0].avgRating * 10) / 10 : 0;

    res.json({
      totalStudents,
      avgRating,
      pendingRequests,
      recentFeedback,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/analytics — Charts data
router.get('/analytics', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(getISTDate());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Rating trends (daily avg)
    const ratingTrends = await Feedback.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: { date: '$date', messId: '$messId' },
          avgRating: { $avg: '$items.rating' },
        },
      },
      {
        $project: {
          date: '$_id.date',
          messId: '$_id.messId',
          avgRating: { $round: ['$avgRating', 1] },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Waste by meal
    const wasteByMeal = await WasteRecord.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$meal',
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    // Poll results
    const pollResults = await MealPoll.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$vote',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ ratingTrends, wasteByMeal, pollResults });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/notifications — Send notification
router.post('/notifications', async (req, res, next) => {
  try {
    const { title, message, recipientType } = req.body;

    if (!title || !message || !recipientType) {
      return res.status(400).json({ error: 'title, message, and recipientType are required' });
    }

    const notification = new Notification({
      title,
      message,
      recipientType,
      createdBy: req.user._id,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/feature-toggle/:name — Toggle feature
router.put('/feature-toggle/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const toggle = await FeatureToggle.findOneAndUpdate(
      { featureName: name },
      {
        $set: {
          isEnabled: req.body.isEnabled,
          enabledAt: req.body.isEnabled ? new Date() : null,
          updatedBy: req.user._id,
        },
      },
      { upsert: true, new: true }
    );

    res.json(toggle);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/switch-requests — List mess switch requests
router.get('/switch-requests', async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const requests = await MessSwitchRequest.find({ status })
      .populate('studentId', 'fullName email rollNumber')
      .populate('fromMess', 'name')
      .populate('toMess', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/switch-requests/:id — Approve/reject
router.put('/switch-requests/:id', async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const request = await MessSwitchRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote,
        processedBy: req.user._id,
        processedAt: new Date(),
      },
      { new: true }
    ).populate('studentId', 'fullName email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If approved, update student's mess assignment
    if (status === 'approved') {
      await User.findByIdAndUpdate(request.studentId._id, { messId: request.toMess });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
