export interface HealthProfile {
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  units: 'metric' | 'imperial';
  healthGoal: 'weight_loss' | 'weight_gain' | 'muscle_building' | 'maintenance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietPreference: 'standard' | 'high_protein' | 'vegan' | 'vegetarian' | 'keto' | 'paleo' | 'mediterranean';
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  waterGoal: number;
  exerciseSuggestion: string;
}

export interface HealthPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  weeklyPlan: DayPlan[];
  recommendations: string[];
  bmr: number;
  tdee: number;
}
