import { useState, useEffect, useCallback } from 'react';
import { 
  WaterLog, 
  FoodLog, 
  FitnessLog, 
  UserProfile, 
  DailyStats,
  FoodItem,
  Habit,
  HabitLog
} from '@/types/wellness';
import { format, isToday, parseISO, differenceInDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const STORAGE_KEYS = {
  WATER_LOGS: 'vitaltrack_water_logs',
  FOOD_LOGS: 'vitaltrack_food_logs',
  FITNESS_LOGS: 'vitaltrack_fitness_logs',
  USER_PROFILE: 'vitaltrack_user_profile',
  DAILY_STATS: 'vitaltrack_daily_stats',
  LAST_VISIT: 'vitaltrack_last_visit',
  HABITS: 'vitaltrack_habits',
  HABIT_LOGS: 'vitaltrack_habit_logs',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Health Warrior',
  goals: {
    waterGoal: 2000,
    calorieGoal: 2000,
    fitnessGoal: 150,
  },
  streak: 0,
  totalPoints: 0,
  achievements: [],
};

const generateId = () => Math.random().toString(36).substring(2, 9);
const today = () => format(new Date(), 'yyyy-MM-dd');
const now = () => format(new Date(), 'HH:mm');

export function useWellnessData() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedWater = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
        const storedFood = localStorage.getItem(STORAGE_KEYS.FOOD_LOGS);
        const storedFitness = localStorage.getItem(STORAGE_KEYS.FITNESS_LOGS);
        const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);

        const storedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
        const storedHabitLogs = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);

        if (storedWater) setWaterLogs(JSON.parse(storedWater));
        if (storedFood) setFoodLogs(JSON.parse(storedFood));
        if (storedFitness) setFitnessLogs(JSON.parse(storedFitness));
        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (storedHabits) setHabits(JSON.parse(storedHabits));
        if (storedHabitLogs) setHabitLogs(JSON.parse(storedHabitLogs));

        // Check and update streak
        if (lastVisit) {
          const daysDiff = differenceInDays(new Date(), parseISO(lastVisit));
          if (daysDiff > 1) {
            // Streak broken
            setProfile(prev => ({ ...prev, streak: 0 }));
          } else if (daysDiff === 1) {
            // Continue streak
            setProfile(prev => ({ ...prev, streak: prev.streak + 1 }));
          }
        }
        localStorage.setItem(STORAGE_KEYS.LAST_VISIT, today());
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading wellness data:', error);
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(waterLogs));
  }, [waterLogs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.FOOD_LOGS, JSON.stringify(foodLogs));
  }, [foodLogs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.FITNESS_LOGS, JSON.stringify(fitnessLogs));
  }, [fitnessLogs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }, [profile, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(habitLogs));
  }, [habitLogs, isLoaded]);

  // Water functions
  const addWater = useCallback((amount: number) => {
    const newLog: WaterLog = {
      id: generateId(),
      date: today(),
      amount,
      time: now(),
    };
    setWaterLogs(prev => [...prev, newLog]);
    addPoints(10);
  }, []);

  const getTodayWater = useCallback(() => {
    return waterLogs
      .filter(log => log.date === today())
      .reduce((sum, log) => sum + log.amount, 0);
  }, [waterLogs]);

  const getWeekWater = useCallback(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return waterLogs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    });
  }, [waterLogs]);

  // Food functions
  const addFood = useCallback((mealType: FoodLog['mealType'], foodItem: FoodItem) => {
    const newLog: FoodLog = {
      id: generateId(),
      date: today(),
      mealType,
      foodItem,
      time: now(),
    };
    setFoodLogs(prev => [...prev, newLog]);
    addPoints(5);
  }, []);

  const updateFood = useCallback((logId: string, foodItem: FoodItem) => {
    setFoodLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, foodItem } : log
    ));
  }, []);

  const deleteFood = useCallback((logId: string) => {
    setFoodLogs(prev => prev.filter(log => log.id !== logId));
  }, []);

  const getTodayCalories = useCallback(() => {
    return foodLogs
      .filter(log => log.date === today())
      .reduce((sum, log) => sum + log.foodItem.calories, 0);
  }, [foodLogs]);

  const getTodayMeals = useCallback(() => {
    return foodLogs.filter(log => log.date === today());
  }, [foodLogs]);

  const getWeekFood = useCallback(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return foodLogs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    });
  }, [foodLogs]);

  // Fitness functions
  const addFitness = useCallback((activityType: string, duration: number, caloriesBurned: number, notes?: string) => {
    const newLog: FitnessLog = {
      id: generateId(),
      date: today(),
      activityType,
      duration,
      caloriesBurned,
      notes,
      time: now(),
    };
    setFitnessLogs(prev => [...prev, newLog]);
    addPoints(15);
  }, []);

  const getTodayFitness = useCallback(() => {
    return fitnessLogs
      .filter(log => log.date === today())
      .reduce((sum, log) => sum + log.duration, 0);
  }, [fitnessLogs]);

  const getTodayFitnessLogs = useCallback(() => {
    return fitnessLogs.filter(log => log.date === today());
  }, [fitnessLogs]);

  const getWeekFitness = useCallback(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    return fitnessLogs.filter(log => {
      const logDate = parseISO(log.date);
      return isWithinInterval(logDate, { start: weekStart, end: weekEnd });
    });
  }, [fitnessLogs]);

  const getWeekFitnessMinutes = useCallback(() => {
    return getWeekFitness().reduce((sum, log) => sum + log.duration, 0);
  }, [getWeekFitness]);

  // Points and profile
  const addPoints = useCallback((points: number) => {
    setProfile(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
    }));
  }, []);

  const updateGoals = useCallback((goals: Partial<UserProfile['goals']>) => {
    setProfile(prev => ({
      ...prev,
      goals: { ...prev.goals, ...goals },
    }));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if all goals completed today
  const checkDailyCompletion = useCallback(() => {
    const waterComplete = getTodayWater() >= profile.goals.waterGoal;
    const caloriesLogged = getTodayMeals().length >= 3;
    const fitnessComplete = getTodayFitness() >= 30;

    if (waterComplete && caloriesLogged && fitnessComplete) {
      addPoints(50);
      return true;
    }
    return false;
  }, [getTodayWater, getTodayMeals, getTodayFitness, profile.goals.waterGoal, addPoints]);

  const getTodayPoints = useCallback(() => {
    const waterPoints = waterLogs.filter(log => log.date === today()).length * 10;
    const foodPoints = foodLogs.filter(log => log.date === today()).length * 5;
    const fitnessPoints = fitnessLogs.filter(log => log.date === today()).length * 15;
    return waterPoints + foodPoints + fitnessPoints;
  }, [waterLogs, foodLogs, fitnessLogs]);

  // Habits functions
  const addHabit = useCallback((name: string, icon: string, color: Habit['color'], targetCount: number, unit: string) => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      icon,
      color,
      targetCount,
      unit,
      createdAt: today(),
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setHabitLogs(prev => prev.filter(log => log.habitId !== habitId));
  }, []);

  const logHabit = useCallback((habitId: string, count: number = 1) => {
    const existingLog = habitLogs.find(log => log.habitId === habitId && log.date === today());
    if (existingLog) {
      setHabitLogs(prev => prev.map(log => 
        log.id === existingLog.id 
          ? { ...log, count: log.count + count }
          : log
      ));
    } else {
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date: today(),
        count,
        time: now(),
      };
      setHabitLogs(prev => [...prev, newLog]);
    }
    addPoints(5);
  }, [habitLogs, addPoints]);

  const getTodayHabitProgress = useCallback((habitId: string) => {
    const log = habitLogs.find(l => l.habitId === habitId && l.date === today());
    return log?.count || 0;
  }, [habitLogs]);

  return {
    // Data
    waterLogs,
    foodLogs,
    fitnessLogs,
    habits,
    habitLogs,
    profile,
    isLoaded,

    // Water
    addWater,
    getTodayWater,
    getWeekWater,

    // Food
    addFood,
    updateFood,
    deleteFood,
    getTodayCalories,
    getTodayMeals,
    getWeekFood,

    // Fitness
    addFitness,
    getTodayFitness,
    getTodayFitnessLogs,
    getWeekFitness,
    getWeekFitnessMinutes,

    // Habits
    addHabit,
    deleteHabit,
    logHabit,
    getTodayHabitProgress,

    // Profile & Points
    updateGoals,
    updateProfile,
    addPoints,
    getTodayPoints,
    checkDailyCompletion,
  };
}
