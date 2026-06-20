const config = require('../config/env');

/**
 * Get current time in IST
 */
function getISTTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + config.istOffset);
}

/**
 * Get today's date in IST (start of day)
 */
function getISTDate() {
  const ist = getISTTime();
  return new Date(ist.getFullYear(), ist.getMonth(), ist.getDate());
}

/**
 * Detect current meal based on IST time
 */
function getCurrentMeal() {
  const hour = getISTTime().getHours();
  const { meals } = config;

  if (hour >= meals.breakfast.start && hour < meals.breakfast.end) return 'breakfast';
  if (hour >= meals.lunch.start && hour < meals.lunch.end) return 'lunch';
  if (hour >= meals.snacks.start && hour < meals.snacks.end) return 'snacks';
  if (hour >= meals.dinner.start && hour < meals.dinner.end) return 'dinner';

  // Outside meal hours — return the next upcoming meal
  if (hour < meals.breakfast.start) return 'breakfast';
  if (hour < meals.lunch.start) return 'lunch';
  if (hour < meals.snacks.start) return 'snacks';
  if (hour < meals.dinner.start) return 'dinner';

  return 'breakfast'; // After dinner, show tomorrow's breakfast
}

/**
 * Check if a meal is currently being served
 */
function isServingTime() {
  const hour = getISTTime().getHours();
  const { meals } = config;

  return Object.values(meals).some(
    (m) => hour >= m.start && hour < m.end
  );
}

/**
 * Get ISO week number to determine odd/even week
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Get current week type (odd/even)
 */
function getWeekType(date) {
  const weekNum = getWeekNumber(date || getISTTime());
  return weekNum % 2 === 0 ? 'even' : 'odd';
}

/**
 * Get day name from date
 */
function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[(date || getISTTime()).getDay()];
}

/**
 * Get time-based greeting
 */
function getGreeting() {
  const hour = getISTTime().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

module.exports = {
  getISTTime,
  getISTDate,
  getCurrentMeal,
  isServingTime,
  getWeekNumber,
  getWeekType,
  getDayName,
  getGreeting,
};
