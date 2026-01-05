import { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENT_DEFINITIONS, UnlockedAchievement, AchievementDefinition } from '@/types/achievements';
import { format, parseISO, differenceInDays } from 'date-fns';

const STORAGE_KEY = 'vitaltrack_achievements';
const PROGRESS_KEY = 'vitaltrack_achievement_progress';

interface AchievementProgress {
  hydration_streak: number;
  calorie_days: number;
  weight_logs: number;
  app_streak: number;
  last_hydration_date?: string;
  last_calorie_date?: string;
}

const DEFAULT_PROGRESS: AchievementProgress = {
  hydration_streak: 0,
  calorie_days: 0,
  weight_logs: 0,
  app_streak: 0,
};

export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress>(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedProgress = localStorage.getItem(PROGRESS_KEY);
      
      if (stored) {
        setUnlockedAchievements(JSON.parse(stored));
      }
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress, isLoaded]);

  const unlockAchievement = useCallback((achievementId: string) => {
    if (unlockedAchievements.some(a => a.achievementId === achievementId)) return;
    
    const newUnlock: UnlockedAchievement = {
      achievementId,
      unlockedAt: new Date().toISOString(),
      progress: 100,
    };
    
    setUnlockedAchievements(prev => [...prev, newUnlock]);
    setNewlyUnlocked(achievementId);
    
    // Clear notification after animation
    setTimeout(() => setNewlyUnlocked(null), 3000);
  }, [unlockedAchievements]);

  const checkAndUnlockAchievements = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Check hydration streak achievements
    if (progress.hydration_streak >= 7) unlockAchievement('hydration_streak_7');
    if (progress.hydration_streak >= 30) unlockAchievement('hydration_streak_30');
    if (progress.hydration_streak >= 90) unlockAchievement('hydration_streak_90');

    // Check calorie goal achievements
    if (progress.calorie_days >= 7) unlockAchievement('calorie_goal_7');
    if (progress.calorie_days >= 30) unlockAchievement('calorie_goal_30');
    if (progress.calorie_days >= 90) unlockAchievement('calorie_goal_90');

    // Check weight milestone achievements
    if (progress.weight_logs >= 5) unlockAchievement('weight_milestone_5');
    if (progress.weight_logs >= 20) unlockAchievement('weight_milestone_20');
    if (progress.weight_logs >= 50) unlockAchievement('weight_milestone_50');

    // Check streak achievements
    if (progress.app_streak >= 7) unlockAchievement('streak_7');
    if (progress.app_streak >= 30) unlockAchievement('streak_30');
    if (progress.app_streak >= 100) unlockAchievement('streak_100');
  }, [progress, unlockAchievement]);

  const recordHydrationGoalMet = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setProgress(prev => {
      if (prev.last_hydration_date === today) return prev;
      
      const isConsecutive = prev.last_hydration_date 
        ? differenceInDays(new Date(), parseISO(prev.last_hydration_date)) === 1
        : false;
      
      return {
        ...prev,
        hydration_streak: isConsecutive ? prev.hydration_streak + 1 : 1,
        last_hydration_date: today,
      };
    });
  }, []);

  const recordCalorieGoalMet = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setProgress(prev => {
      if (prev.last_calorie_date === today) return prev;
      
      return {
        ...prev,
        calorie_days: prev.calorie_days + 1,
        last_calorie_date: today,
      };
    });
  }, []);

  const recordWeightLog = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      weight_logs: prev.weight_logs + 1,
    }));
  }, []);

  const updateAppStreak = useCallback((streak: number) => {
    setProgress(prev => ({
      ...prev,
      app_streak: streak,
    }));
  }, []);

  // Check achievements when progress changes
  useEffect(() => {
    if (isLoaded) {
      checkAndUnlockAchievements();
    }
  }, [progress, isLoaded, checkAndUnlockAchievements]);

  const getAchievementProgress = useCallback((achievement: AchievementDefinition): number => {
    const unlocked = unlockedAchievements.find(a => a.achievementId === achievement.id);
    if (unlocked) return 100;

    switch (achievement.category) {
      case 'hydration':
        return Math.min((progress.hydration_streak / achievement.requirement) * 100, 100);
      case 'nutrition':
        return Math.min((progress.calorie_days / achievement.requirement) * 100, 100);
      case 'streak':
        return Math.min((progress.app_streak / achievement.requirement) * 100, 100);
      default:
        return 0;
    }
  }, [unlockedAchievements, progress]);

  const isUnlocked = useCallback((achievementId: string) => {
    return unlockedAchievements.some(a => a.achievementId === achievementId);
  }, [unlockedAchievements]);

  const getUnlockDate = useCallback((achievementId: string): string | undefined => {
    const achievement = unlockedAchievements.find(a => a.achievementId === achievementId);
    return achievement?.unlockedAt;
  }, [unlockedAchievements]);

  return {
    achievements: ACHIEVEMENT_DEFINITIONS,
    unlockedAchievements,
    progress,
    newlyUnlocked,
    isLoaded,
    recordHydrationGoalMet,
    recordCalorieGoalMet,
    recordWeightLog,
    updateAppStreak,
    getAchievementProgress,
    isUnlocked,
    getUnlockDate,
  };
}
