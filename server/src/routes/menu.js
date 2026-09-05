const express = require('express');
const VegMenu = require('../models/VegMenu');
const NonVegMenu = require('../models/NonVegMenu');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getCurrentMeal, getWeekType, getDayName, getISTDate } = require('../utils/timeUtils');
const cacheMiddleware = require('../middleware/cacheMiddleware');
const { flushCache } = require('../utils/cache');

const router = express.Router();

const MessHall = require('../models/MessHall');

// GET /api/menu/today — Get today's menu (public)
router.get('/today', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const today = getISTDate();
    const currentMeal = req.query.meal || getCurrentMeal();
    const dayName = getDayName(today);
    const weekType = getWeekType(today);

    // Veg menu for today
    const vegMenus = await VegMenu.find({
      day: dayName,
      weekType,
      meal: currentMeal,
    }).populate('messId', 'name slug');

    // Non-veg menu for today
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const dbNonVegMenus = await NonVegMenu.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      meal: currentMeal,
    }).populate('messId', 'name slug');

    const activeMesses = await MessHall.find({ isActive: true });
    const nonVegMenus = [];

    for (const mess of activeMesses) {
      const existingMenu = dbNonVegMenus.find(m => m.messId && (m.messId._id.toString() === mess._id.toString() || m.messId.toString() === mess._id.toString()));
      const vegMenuForMess = vegMenus.find(m => m.messId && (m.messId._id.toString() === mess._id.toString() || m.messId.toString() === mess._id.toString()));
      
      const nonVegItems = [];
      if (vegMenuForMess && vegMenuForMess.items) {
        vegMenuForMess.items.forEach(item => {
          if (item.isVeg === false) {
            nonVegItems.push({
              name: item.name,
              cost: 0,
              icon: item.icon || '🥚',
              isVeg: false,
              _id: item._id
            });
          }
        });
      }

      if (existingMenu && existingMenu.items) {
        existingMenu.items.forEach(existing => {
          if (!nonVegItems.some(i => i.name.toLowerCase() === existing.name.toLowerCase())) {
            nonVegItems.push({
              name: existing.name,
              cost: 0,
              icon: existing.icon || '🍗',
              isVeg: false,
              _id: existing._id
            });
          }
        });
      }

      if (nonVegItems.length > 0) {
        nonVegMenus.push({
          _id: existingMenu ? existingMenu._id : `free-nonveg-${mess._id}`,
          messId: {
            _id: mess._id,
            name: mess.name,
            slug: mess.slug
          },
          date: today,
          meal: currentMeal,
          items: nonVegItems
        });
      }
    }

    res.json({
      date: today,
      day: dayName,
      weekType,
      currentMeal,
      vegMenus,
      nonVegMenus,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/menu/today/all — Get today's menu for ALL meals in a single response
// Used by the client to pre-fetch all meal data and enable instant tab switching
router.get('/today/all', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const today = getISTDate();
    const dayName = getDayName(today);
    const weekType = getWeekType(today);
    const currentMeal = getCurrentMeal();
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    // Single query: fetch all veg menus for today (all meals)
    const allVegMenus = await VegMenu.find({
      day: dayName,
      weekType,
      meal: { $in: mealTypes },
    }).populate('messId', 'name slug');

    // Single query: fetch all non-veg menus for today (all meals)
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const allDbNonVegMenus = await NonVegMenu.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      meal: { $in: mealTypes },
    }).populate('messId', 'name slug');

    const activeMesses = await MessHall.find({ isActive: true });

    // Build response grouped by meal
    const meals = {};
    for (const meal of mealTypes) {
      const vegMenus = allVegMenus.filter(m => m.meal === meal);
      const dbNonVegMenus = allDbNonVegMenus.filter(m => m.meal === meal);

      const nonVegMenus = [];
      for (const mess of activeMesses) {
        const existingMenu = dbNonVegMenus.find(m => m.messId && (m.messId._id.toString() === mess._id.toString() || m.messId.toString() === mess._id.toString()));
        const vegMenuForMess = vegMenus.find(m => m.messId && (m.messId._id.toString() === mess._id.toString() || m.messId.toString() === mess._id.toString()));

        const nonVegItems = [];
        if (vegMenuForMess && vegMenuForMess.items) {
          vegMenuForMess.items.forEach(item => {
            if (item.isVeg === false) {
              nonVegItems.push({
                name: item.name,
                cost: 0,
                icon: item.icon || '🥚',
                isVeg: false,
                _id: item._id
              });
            }
          });
        }

        if (existingMenu && existingMenu.items) {
          existingMenu.items.forEach(existing => {
            if (!nonVegItems.some(i => i.name.toLowerCase() === existing.name.toLowerCase())) {
              nonVegItems.push({
                name: existing.name,
                cost: 0,
                icon: existing.icon || '🍗',
                isVeg: false,
                _id: existing._id
              });
            }
          });
        }

        if (nonVegItems.length > 0) {
          nonVegMenus.push({
            _id: existingMenu ? existingMenu._id : `free-nonveg-${mess._id}`,
            messId: {
              _id: mess._id,
              name: mess.name,
              slug: mess.slug
            },
            date: today,
            meal,
            items: nonVegItems
          });
        }
      }

      meals[meal] = { vegMenus, nonVegMenus };
    }

    res.json({
      date: today,
      day: dayName,
      weekType,
      currentMeal,
      meals,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/menu/weekly/:messId — Full weekly menu for a mess
router.get('/weekly/:messId', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const { messId } = req.params;
    const weekType = req.query.weekType || getWeekType();

    const menus = await VegMenu.find({
      messId,
      weekType,
    }).populate('messId', 'name slug').sort({ day: 1, meal: 1 });

    // Organize by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekly = {};
    days.forEach((day) => {
      weekly[day] = {
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: [],
      };
    });

    menus.forEach((menu) => {
      if (weekly[menu.day] && weekly[menu.day][menu.meal]) {
        weekly[menu.day][menu.meal] = menu.items;
      }
    });

    res.json({ messId, weekType, weekly });
  } catch (error) {
    next(error);
  }
});

// GET /api/menu/non-veg/today — Today's non-veg across all messes
router.get('/non-veg/today', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const today = getISTDate();
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const menus = await NonVegMenu.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate('messId', 'name slug');

    res.json({ date: today, menus });
  } catch (error) {
    next(error);
  }
});

// POST /api/menu/non-veg — Add non-veg items (mess_official only)
router.post('/non-veg', authenticate, roleGuard('mess_official', 'admin'), async (req, res, next) => {
  try {
    const { messId, meal, items } = req.body;

    if (!messId || !meal || !items || !items.length) {
      return res.status(400).json({ error: 'messId, meal, and items are required' });
    }

    const today = getISTDate();
    const menu = new NonVegMenu({
      messId,
      date: today,
      meal,
      items,
      createdBy: req.user._id,
    });

    await menu.save();
    await flushCache();
    const populated = await menu.populate('messId', 'name slug');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

// PUT /api/menu/veg/:id — Update veg menu (admin only)
router.put('/veg/:id', authenticate, roleGuard('admin'), async (req, res, next) => {
  try {
    const { items } = req.body;
    const menu = await VegMenu.findByIdAndUpdate(
      req.params.id,
      { items },
      { new: true }
    ).populate('messId', 'name slug');

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    await flushCache();
    res.json(menu);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
