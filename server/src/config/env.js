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

  // Meal schedule (IST hours)
  meals: {
    breakfast: { start: 7, end: 9, label: 'Breakfast' },
    lunch:     { start: 12, end: 14, label: 'Lunch' },
    snacks:    { start: 17, end: 18, label: 'Snacks' },
    dinner:    { start: 19, end: 21, label: 'Dinner' },
  },
};

module.exports = config;
