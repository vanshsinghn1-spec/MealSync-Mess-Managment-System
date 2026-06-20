const express = require('express');
const MealPoll = require('../models/MealPoll');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getISTDate } = require('../utils/timeUtils');
const mongoose = require('mongoose');

const router = express.Router();

// POST /api/polls/vote — Cast vote (student)
router.post('/vote', authenticate, roleGuard('student'), async (req, res, next) => {
  try {
    const { messId, meal, vote } = req.body;

    if (!messId || !meal || !vote) {
      return res.status(400).json({ error: 'messId, meal, and vote are required' });
    }

    const today = getISTDate();

    // Upsert: update if exists, create if not
    const poll = await MealPoll.findOneAndUpdate(
      { studentId: req.user._id, messId, date: today, meal },
      { vote },
      { upsert: true, new: true }
    );

    res.json(poll);
  } catch (error) {
    next(error);
  }
});

// GET /api/polls/stats/:messId/:meal — Poll results
router.get('/stats/:messId/:meal', async (req, res, next) => {
  try {
    const { messId, meal } = req.params;
    const today = getISTDate();

    const stats = await MealPoll.aggregate([
      {
        $match: {
          messId: mongoose.Types.ObjectId.createFromHexString(messId),
          meal,
          date: today,
        },
      },
      {
        $group: {
          _id: '$vote',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { likes: 0, dislikes: 0, total: 0 };
    stats.forEach((s) => {
      if (s._id === 'like') result.likes = s.count;
      if (s._id === 'dislike') result.dislikes = s.count;
    });
    result.total = result.likes + result.dislikes;

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
