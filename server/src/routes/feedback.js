const express = require('express');
const Feedback = require('../models/Feedback');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getISTDate } = require('../utils/timeUtils');

const router = express.Router();

// POST /api/feedback — Submit feedback (student)
router.post('/', authenticate, roleGuard('student'), async (req, res, next) => {
  try {
    const { messId, meal, items, overallComment } = req.body;

    if (!messId || !meal || !items || !items.length) {
      return res.status(400).json({ error: 'messId, meal, and items are required' });
    }

    const today = getISTDate();
    const feedback = new Feedback({
      studentId: req.user._id,
      messId,
      date: today,
      meal,
      items,
      overallComment,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'You have already submitted feedback for this meal today' });
    }
    next(error);
  }
});

// GET /api/feedback/my — Student's feedback history
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ studentId: req.user._id })
      .populate('messId', 'name slug')
      .sort({ date: -1 })
      .limit(30);
    res.json(feedbacks);
  } catch (error) {
    next(error);
  }
});

// GET /api/feedback/summary/:messId — Feedback summary (admin/mess)
router.get('/summary/:messId', authenticate, roleGuard('admin', 'mess_official'), async (req, res, next) => {
  try {
    const { messId } = req.params;
    const thirtyDaysAgo = new Date(getISTDate());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const summary = await Feedback.aggregate([
      { $match: { messId: require('mongoose').Types.ObjectId.createFromHexString(messId), date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { date: '$date', meal: '$meal' },
          totalStudents: { $addToSet: '$studentId' },
          avgRating: { $avg: { $avg: '$items.rating' } },
          feedbackCount: { $sum: 1 },
        },
      },
      {
        $project: {
          date: '$_id.date',
          meal: '$_id.meal',
          totalStudents: { $size: '$totalStudents' },
          avgRating: { $round: ['$avgRating', 1] },
          feedbackCount: 1,
          _id: 0,
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// GET /api/feedback/recent — Recent public feedback (anonymized)
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const feedbacks = await Feedback.find()
      .populate('messId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-studentId'); // Anonymize

    res.json(feedbacks);
  } catch (error) {
    next(error);
  }
});

// GET /api/feedback/ratings/:messId — Avg ratings per food item
router.get('/ratings/:messId', async (req, res, next) => {
  try {
    const { messId } = req.params;
    const thirtyDaysAgo = new Date(getISTDate());
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ratings = await Feedback.aggregate([
      { $match: { messId: require('mongoose').Types.ObjectId.createFromHexString(messId), date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.foodItem',
          avgRating: { $avg: '$items.rating' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          foodItem: '$_id',
          avgRating: { $round: ['$avgRating', 1] },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.json(ratings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
