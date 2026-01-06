import { useEffect, useCallback } from 'react';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { useWellnessData } from '@/hooks/useWellnessData';
import { HealthPlan, DayPlan } from '@/types/healthCoach';

/**
 * Hook to sync AI plan goals to wellness data
 * This ensures consistency across the app
 */
export function useAIPlanSync() {
  const { healthPlan, healthProfile, isLoaded: planLoaded } = useUserPlan();
  const { updateGoals, profile, isLoaded: wellnessLoaded } = useWellnessData();

  // Sync AI plan goals to wellness data when plan changes
  useEffect(() => {
    if (!planLoaded || !wellnessLoaded || !healthPlan) return;

    // Get water goal from today's plan or use a default based on profile
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];
    
    const todayPlan = healthPlan.weeklyPlan?.find(
      (day) => day.day.toLowerCase() === todayName.toLowerCase()
    );

    const waterGoal = todayPlan?.waterGoal || 2500; // Default 2.5L if not specified

    // Only update if goals are different to avoid unnecessary updates
    const needsUpdate = 
      profile.goals.calorieGoal !== healthPlan.dailyCalories ||
      profile.goals.waterGoal !== waterGoal ||
      profile.goals.macros?.protein !== healthPlan.macros.protein ||
      profile.goals.macros?.carbs !== healthPlan.macros.carbs ||
      profile.goals.macros?.fat !== healthPlan.macros.fats;

    if (needsUpdate) {
      updateGoals({
        calorieGoal: healthPlan.dailyCalories,
        waterGoal: waterGoal,
        macros: {
          protein: healthPlan.macros.protein,
          carbs: healthPlan.macros.carbs,
          fat: healthPlan.macros.fats,
        },
      });
    }
  }, [healthPlan, planLoaded, wellnessLoaded, updateGoals, profile.goals]);

  // Get whether user has an AI plan
  const hasAIPlan = !!healthPlan;

  // Get today's specific plan from the weekly plan
  const getTodayPlan = useCallback((): DayPlan | null => {
    if (!healthPlan?.weeklyPlan) return null;
    
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];
    
    return healthPlan.weeklyPlan.find(
      (day) => day.day.toLowerCase() === todayName.toLowerCase()
    ) || null;
  }, [healthPlan]);

  // Get AI plan display info
  const getAIPlanInfo = useCallback(() => {
    if (!healthPlan) {
      return {
        dailyCalories: profile.goals.calorieGoal,
        waterGoal: profile.goals.waterGoal,
        macros: profile.goals.macros || { protein: 120, carbs: 200, fat: 65 },
        isAIPlan: false,
      };
    }

    const todayPlan = getTodayPlan();

    return {
      dailyCalories: healthPlan.dailyCalories,
      waterGoal: todayPlan?.waterGoal || 2500,
      macros: healthPlan.macros,
      isAIPlan: true,
      bmr: healthPlan.bmr,
      tdee: healthPlan.tdee,
      recommendations: healthPlan.recommendations,
      exerciseSuggestion: todayPlan?.exerciseSuggestion,
    };
  }, [healthPlan, profile.goals, getTodayPlan]);

  return {
    hasAIPlan,
    healthPlan,
    healthProfile,
    getTodayPlan,
    getAIPlanInfo,
  };
}
