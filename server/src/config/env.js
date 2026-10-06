require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mealsync',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || 'nextauth-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',

  // IST timezone offset
  istOffset: 5.5 * 60 * 60 * 1000,

  // Meal schedule (IST hours & minutes)
  meals: {
    breakfast: {
      start: 7,
      end: 9.5,
      startMinutes: 420,  // 07:00
      endMinutes: 570,    // 09:30
      timeStr: '7:00 AM – 9:30 AM',
      label: 'Breakfast'
    },
    lunch: {
      start: 12,
      end: 14.5,
      startMinutes: 720,  // 12:00
      endMinutes: 870,    // 14:30
      timeStr: '12:00 PM – 2:30 PM',
      label: 'Lunch'
    },
    snacks: {
      start: 16.75,
      end: 18,
      startMinutes: 1005, // 16:45 (4:45 PM)
      endMinutes: 1080,   // 18:00 (6:00 PM)
      timeStr: '4:45 PM – 6:00 PM',
      label: 'Snacks'
    },
    dinner: {
      start: 19,
      end: 21.5,
      startMinutes: 1140, // 19:00 (7:00 PM)
      endMinutes: 1290,   // 21:30 (9:30 PM)
      timeStr: '7:00 PM – 9:30 PM',
      label: 'Dinner'
    },
  },
};

module.exports = config;
