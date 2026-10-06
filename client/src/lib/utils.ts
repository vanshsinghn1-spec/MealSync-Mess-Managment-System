import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}


export function getMealLabel(meal: string) {
  return meal.charAt(0).toUpperCase() + meal.slice(1);
}

/**
 * Campus Mess Meal Schedule (IST):
 * - Breakfast: 7:00 AM – 9:30 AM
 * - Lunch:     12:00 PM – 2:30 PM
 * - Snacks:    4:45 PM – 6:00 PM
 * - Dinner:    7:00 PM – 9:30 PM
 */
export const MEAL_SCHEDULE = {
  breakfast: {
    id: "breakfast",
    name: "Breakfast",
    time: "07:00 – 09:30 AM",
    startMinutes: 420,  // 07:00
    endMinutes: 570,    // 09:30
  },
  lunch: {
    id: "lunch",
    name: "Lunch",
    time: "12:00 – 02:30 PM",
    startMinutes: 720,  // 12:00
    endMinutes: 870,    // 14:30
  },
  snacks: {
    id: "snacks",
    name: "Snacks",
    time: "04:45 – 06:00 PM",
    startMinutes: 1005, // 16:45
    endMinutes: 1080,   // 18:00
  },
  dinner: {
    id: "dinner",
    name: "Dinner",
    time: "07:00 – 09:30 PM",
    startMinutes: 1140, // 19:00
    endMinutes: 1290,   // 21:30
  },
} as const;

export type MealId = keyof typeof MEAL_SCHEDULE;

/**
 * Returns current meal to display/select based on the current time:
 * - Active during serving hours
 * - If between meals, returns next upcoming meal
 * - After dinner (past 9:30 PM), cycles to next day's breakfast
 */
export function getCurrentMealId(date = new Date()): string {
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins < MEAL_SCHEDULE.breakfast.endMinutes) return "breakfast";
  if (mins < MEAL_SCHEDULE.lunch.endMinutes) return "lunch";
  if (mins < MEAL_SCHEDULE.snacks.endMinutes) return "snacks";
  if (mins < MEAL_SCHEDULE.dinner.endMinutes) return "dinner";
  return "breakfast"; // After 9:30 PM, show tomorrow's breakfast
}

/**
 * Returns the name of the meal currently being served LIVE, or null if outside serving hours.
 */
export function getLiveServingMeal(date = new Date()): string | null {
  const mins = date.getHours() * 60 + date.getMinutes();
  for (const meal of Object.values(MEAL_SCHEDULE)) {
    if (mins >= meal.startMinutes && mins < meal.endMinutes) {
      return meal.name;
    }
  }
  return null;
}

