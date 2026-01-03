export interface WaterLog {
  id: string;
  date: string;
  amount: number;
  time: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
}

export interface FoodLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: FoodItem;
  time: string;
}

export interface FitnessLog {
  id: string;
  date: string;
  activityType: string;
  duration: number;
  caloriesBurned: number;
  notes?: string;
  time: string;
}

export interface MacroGoals {
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
}

export interface UserGoals {
  waterGoal: number; // in ml
  calorieGoal: number;
  fitnessGoal: number; // in minutes per week
  macros?: MacroGoals;
}

export interface DailyStats {
  date: string;
  waterIntake: number;
  caloriesConsumed: number;
  fitnessMinutes: number;
  points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'water' | 'nutrition' | 'fitness' | 'streak';
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: 'water' | 'nutrition' | 'fitness' | 'custom';
  targetCount: number;
  unit: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  count: number;
  time: string;
}

export interface UserProfile {
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number; // kg
  height?: number; // cm
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: UserGoals;
  streak: number;
  totalPoints: number;
  achievements: string[];
}
