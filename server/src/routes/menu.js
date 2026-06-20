const express = require('express');
const VegMenu = require('../models/VegMenu');
const NonVegMenu = require('../models/NonVegMenu');
const { authenticate, roleGuard } = require('../middleware/auth');
const { getCurrentMeal, getWeekType, getDayName, getISTDate } = require('../utils/timeUtils');

const router = express.Router();

const MessHall = require('../models/MessHall');

// GET /api/menu/today — Get today's menu (public)
router.get('/today', async (req, res, next) => {
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

    // Generate special paid menu items for today
    const specialPrices = {
      "Boiled Egg": 10,
      "Omelette Only": 20,
      "Omelette only": 20,
      "Omelette": 20,
      "Bread Omelette": 30,
      "Pav Bhaji": 40,
      "Dahi Puri": 40,
      "Egg Burji": 30,
      "Egg burji": 30,
      "Egg Curry": 30,
      "Egg curry": 30,
      "Veg Manchurian": 60,
      "Mushroom Curry": 60,
      "Baby corn Manchurian": 60,
      "Kadai Chicken": 100,
      "Chilli Chicken": 80,
      "Chicken Curry": 100,
      "Chicken 65": 60,
      "Butter Chicken": 100,
      "Butter Chicken Masala": 100
    };

    const getSpecialItemDetails = (name) => {
      const price = specialPrices[name] || 0;
      let icon = '🍲';
      let isVeg = false;

      const lowerName = name.toLowerCase();

      // Determine if Veg
      if (
        lowerName.includes('pav bhaji') ||
        lowerName.includes('dahi puri') ||
        lowerName.includes('veg manchurian') ||
        lowerName.includes('mushroom curry') ||
        lowerName.includes('baby corn manchurian')
      ) {
        isVeg = true;
      }

      if (lowerName.includes('boiled egg')) {
        icon = '🥚';
      } else if (lowerName.includes('omelette')) {
        icon = '🍳';
      } else if (lowerName.includes('chicken') || lowerName.includes('65')) {
        icon = '🍗';
      } else if (lowerName.includes('manchurian') && lowerName.includes('veg')) {
        icon = '🥦';
      } else if (lowerName.includes('bhaji')) {
        icon = '🥯';
      }
      return { name, cost: price, icon, isVeg };
    };

    const getSpecialMenuForDay = (wType, dName, ml) => {
      const menu = {
        even: {
          Monday: { breakfast: ["Boiled Egg"], snacks: ["Pav Bhaji"], dinner: ["Egg Burji"] },
          Tuesday: { breakfast: ["Omelette Only"], dinner: ["Chilli Chicken"] },
          Wednesday: { breakfast: ["Boiled Egg"], snacks: ["Bread Omelette"] },
          Thursday: { breakfast: ["Boiled Egg"], dinner: ["Kadai Chicken"] },
          Friday: { breakfast: ["Omelette Only"], dinner: ["Veg Manchurian"] },
          Saturday: { breakfast: ["Boiled Egg"], dinner: ["Mushroom Curry"] },
          Sunday: { breakfast: ["Boiled Egg"], lunch: ["Butter Chicken"] },
        },
        odd: {
          Monday: { breakfast: ["Boiled Egg"], dinner: ["Egg Curry"] },
          Tuesday: { breakfast: ["Omelette Only"], dinner: ["Chicken Curry"] },
          Wednesday: { breakfast: ["Boiled Egg"], snacks: ["Bread Omelette"], dinner: ["Mushroom Curry"] },
          Thursday: { breakfast: ["Boiled Egg"], dinner: ["Kadai Chicken"] },
          Friday: { breakfast: ["Omelette only"], dinner: ["Chicken 65"] },
          Saturday: { breakfast: ["Boiled Egg"], snacks: ["Dahi Puri"], dinner: ["Baby corn Manchurian"] },
          Sunday: { breakfast: ["Boiled Egg"], lunch: ["Butter Chicken"] },
        }
      };

      const items = menu[wType]?.[dName]?.[ml] || [];
      return items.map(getSpecialItemDetails);
    };

    const specialItems = getSpecialMenuForDay(weekType, dayName, currentMeal);

    // Merge special items into nonVegMenus list for each mess
    const activeMesses = await MessHall.find({ isActive: true });
    const nonVegMenus = [];

    for (const mess of activeMesses) {
      // Find if we already have non-veg menu in DB for this mess
      const existingMenu = dbNonVegMenus.find(m => m.messId && (m.messId._id.toString() === mess._id.toString() || m.messId.toString() === mess._id.toString()));
      
      const mergedItems = [];
      
      // Add special paid menu items first
      specialItems.forEach(item => {
        mergedItems.push(item);
      });

      // Add user/official created items next (avoiding duplicates if they add the same name)
      if (existingMenu && existingMenu.items) {
        existingMenu.items.forEach(existing => {
          if (!mergedItems.some(i => i.name.toLowerCase() === existing.name.toLowerCase())) {
            mergedItems.push({
              name: existing.name,
              cost: existing.cost,
              icon: existing.icon || '🍗',
              _id: existing._id
            });
          }
        });
      }

      if (mergedItems.length > 0) {
        nonVegMenus.push({
          _id: existingMenu ? existingMenu._id : `temp-special-${mess._id}`,
          messId: {
            _id: mess._id,
            name: mess.name,
            slug: mess.slug
          },
          date: today,
          meal: currentMeal,
          items: mergedItems
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

// GET /api/menu/weekly/:messId — Full weekly menu for a mess
router.get('/weekly/:messId', async (req, res, next) => {
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
router.get('/non-veg/today', async (req, res, next) => {
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
    res.json(menu);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
