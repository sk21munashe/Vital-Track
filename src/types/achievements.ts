export type AchievementTier = 'bronze' | 'silver' | 'gold';
export type AchievementCategory = 'hydration' | 'nutrition' | 'streak';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  requirement: number;
  unit: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Hydration achievements
  {
    id: 'hydration_streak_7',
    name: 'Hydration Starter',
    description: 'Hit your water goal for 7 consecutive days',
    icon: 'Droplets',
    category: 'hydration',
    tier: 'bronze',
    requirement: 7,
    unit: 'days',
  },
  {
    id: 'hydration_streak_30',
    name: 'Hydration Pro',
    description: 'Hit your water goal for 30 consecutive days',
    icon: 'Droplets',
    category: 'hydration',
    tier: 'silver',
    requirement: 30,
    unit: 'days',
  },
  {
    id: 'hydration_streak_90',
    name: 'Hydration Master',
    description: 'Hit your water goal for 90 consecutive days',
    icon: 'Droplets',
    category: 'hydration',
    tier: 'gold',
    requirement: 90,
    unit: 'days',
  },

  // Calorie/Nutrition achievements
  {
    id: 'calorie_goal_7',
    name: 'Nutrition Novice',
    description: 'Meet your calorie goal for 7 days',
    icon: 'Utensils',
    category: 'nutrition',
    tier: 'bronze',
    requirement: 7,
    unit: 'days',
  },
  {
    id: 'calorie_goal_30',
    name: 'Nutrition Expert',
    description: 'Meet your calorie goal for 30 days',
    icon: 'Utensils',
    category: 'nutrition',
    tier: 'silver',
    requirement: 30,
    unit: 'days',
  },
  {
    id: 'calorie_goal_90',
    name: 'Nutrition Champion',
    description: 'Meet your calorie goal for 90 days',
    icon: 'Utensils',
    category: 'nutrition',
    tier: 'gold',
    requirement: 90,
    unit: 'days',
  },

  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day app usage streak',
    icon: 'Flame',
    category: 'streak',
    tier: 'bronze',
    requirement: 7,
    unit: 'days',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day app usage streak',
    icon: 'Flame',
    category: 'streak',
    tier: 'silver',
    requirement: 30,
    unit: 'days',
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day app usage streak',
    icon: 'Flame',
    category: 'streak',
    tier: 'gold',
    requirement: 100,
    unit: 'days',
  },
];
