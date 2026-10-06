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
 * Breakfast: 7:00 AM – 9:30 AM (420 – 570 mins)
 * Lunch:     12:00 PM – 2:30 PM (720 – 870 mins)
 * Snacks:    4:45 PM – 6:00 PM (1005 – 1080 mins)
 * Dinner:    7:00 PM – 9:30 PM (1140 – 1290 mins)
 */
function getCurrentMeal() {
  const ist = getISTTime();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const { meals } = config;

  // Active meal checks
  if (mins >= meals.breakfast.startMinutes && mins < meals.breakfast.endMinutes) return 'breakfast';
  if (mins >= meals.lunch.startMinutes && mins < meals.lunch.endMinutes) return 'lunch';
  if (mins >= meals.snacks.startMinutes && mins < meals.snacks.endMinutes) return 'snacks';
  if (mins >= meals.dinner.startMinutes && mins < meals.dinner.endMinutes) return 'dinner';

  // Outside meal hours — return the upcoming meal
  if (mins < meals.breakfast.startMinutes) return 'breakfast';
  if (mins < meals.lunch.startMinutes) return 'lunch';
  if (mins < meals.snacks.startMinutes) return 'snacks';
  if (mins < meals.dinner.startMinutes) return 'dinner';

  return 'breakfast'; // After dinner (after 21:30), show tomorrow's breakfast
}

/**
 * Check if a meal is currently being served
 */
function isServingTime() {
  const ist = getISTTime();
  const mins = ist.getHours() * 60 + ist.getMinutes();
  const { meals } = config;

  return Object.values(meals).some(
    (m) => mins >= m.startMinutes && mins < m.endMinutes
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
 * Mess week cycle starts on Sunday.
 */
function getWeekType(date) {
  const d = new Date(date || getISTTime());
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }
  const weekNum = getWeekNumber(d);
  return weekNum % 2 === 0 ? 'odd' : 'even';
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
