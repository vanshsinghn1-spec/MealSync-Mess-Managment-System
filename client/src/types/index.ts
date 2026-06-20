export interface User {
  _id: string;
  email: string;
  role: "student" | "mess_official" | "admin";
  fullName: string;
  rollNumber?: string;
  phone?: string;
  messId?: MessHall;
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface MessHall {
  _id: string;
  name: string;
  slug: string;
  location?: string;
  capacity: number;
  isActive: boolean;
}

export interface MenuItem {
  name: string;
  icon: string;
}

export interface VegMenu {
  _id: string;
  messId: MessHall;
  day: string;
  weekType: "odd" | "even";
  meal: MealType;
  items: MenuItem[];
}

export interface NonVegMenuItem {
  name: string;
  cost: number;
  icon: string;
}

export interface NonVegMenu {
  _id: string;
  messId: MessHall;
  date: string;
  meal: MealType;
  items: NonVegMenuItem[];
}

export interface FeedbackItem {
  foodItem: string;
  rating: number;
  comment: string;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface Feedback {
  _id: string;
  studentId: string;
  messId: MessHall;
  date: string;
  meal: MealType;
  items: FeedbackItem[];
  overallComment: string;
  createdAt: string;
}

export interface PollStats {
  likes: number;
  dislikes: number;
  total: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  recipientType: "all" | "students" | "mess_officials";
  createdAt: string;
}

export interface MessSwitchRequest {
  _id: string;
  studentId: User;
  fromMess: MessHall;
  toMess: MessHall;
  status: "pending" | "approved" | "rejected";
  reason: string;
  adminNote: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  avgRating: number;
  pendingRequests: number;
  recentFeedback: Feedback[];
}

export interface FeedbackSummary {
  date: string;
  meal: string;
  totalStudents: number;
  avgRating: number;
  feedbackCount: number;
}

export interface FoodRating {
  foodItem: string;
  avgRating: number;
  count: number;
}

export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

export interface WeeklyMenu {
  [day: string]: {
    breakfast: MenuItem[];
    lunch: MenuItem[];
    snacks: MenuItem[];
    dinner: MenuItem[];
  };
}
