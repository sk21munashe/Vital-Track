import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Droplets, Utensils, ChevronLeft, ChevronRight, Scale, TrendingUp, TrendingDown, Target, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '@/components/ProgressRing';
import { StreakBadge } from '@/components/StreakBadge';
import { PointsBadge } from '@/components/PointsBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { ProgressCharts } from '@/components/ProgressCharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIPlanCard } from '@/components/AIPlanCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { motivationalQuotes } from '@/data/foodDatabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { WelcomeTour, useTourStatus } from '@/components/WelcomeTour';

export default function Dashboard() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [preferredName, setPreferredName] = useState<string | null>(null);
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const {
    profile,
    waterLogs,
    foodLogs,
    getTodayWater,
    getTodayCalories,
    getTodayMeals,
    getTodayPoints,
    addWater,
  } = useWellnessData();

  // Use the global user plan context (data synced from database)
  useUserPlan();

  const { showTour, completeTour } = useTourStatus();
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Fetch preferred name and health data from profiles/health plans
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('preferred_name')
          .eq('user_id', user.id)
          .single();
        
        if (profileData?.preferred_name) {
          setPreferredName(profileData.preferred_name);
        }

        // Fetch health plan data for weight and height
        const { data: healthPlanData } = await supabase
          .from('user_health_plans')
          .select('health_profile, health_plan')
          .eq('user_id', user.id)
          .single();
        
        if (healthPlanData) {
          const healthProfile = healthPlanData.health_profile as any;
          const healthPlan = healthPlanData.health_plan as any;
          
          if (healthProfile?.currentWeight) {
            setCurrentWeight(healthProfile.currentWeight);
          }
          if (healthProfile?.height) {
            setUserHeight(healthProfile.height);
          }
        }
      }
    };
    fetchUserData();
  }, []);

  // Sticky header observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Get data for selected day
  const getWaterForDay = (day: 'today' | 'yesterday') => {
    const dateStr = format(day === 'today' ? new Date() : subDays(new Date(), 1), 'yyyy-MM-dd');
    return waterLogs
      .filter(log => log.date === dateStr)
      .reduce((sum, log) => sum + log.amount, 0);
  };

  const getCaloriesForDay = (day: 'today' | 'yesterday') => {
    const dateStr = format(day === 'today' ? new Date() : subDays(new Date(), 1), 'yyyy-MM-dd');
    return foodLogs
      .filter(log => log.date === dateStr)
      .reduce((sum, log) => sum + log.foodItem.calories, 0);
  };

  const todayWater = getTodayWater();
  const todayCalories = getTodayCalories();
  const todayPoints = getTodayPoints();
  const todayMeals = getTodayMeals();

  // Count unique meal types logged today (breakfast, lunch, dinner)
  const getTodayMealsLogged = useCallback(() => {
    const mealTypes = new Set(todayMeals.map(meal => meal.mealType));
    // Only count main meals (breakfast, lunch, dinner), not snacks
    return ['breakfast', 'lunch', 'dinner'].filter(type => mealTypes.has(type as any)).length;
  }, [todayMeals]);

  const displayWater = getWaterForDay(selectedDay);
  const displayCalories = getCaloriesForDay(selectedDay);

  const waterProgress = (displayWater / profile.goals.waterGoal) * 100;
  const caloriesProgress = (displayCalories / profile.goals.calorieGoal) * 100;

  const handleQuickWater = (amount: number) => {
    addWater(amount);
    setShowQuickAdd(false);
  };

  const handleLogWeight = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) return;
    
    setCurrentWeight(weight);
    setWeightInput('');
    setShowWeightInput(false);
    
    // Update the health plan in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: healthPlanData } = await supabase
        .from('user_health_plans')
        .select('health_profile')
        .eq('user_id', user.id)
        .single();
      
      if (healthPlanData) {
        const updatedProfile = {
          ...(healthPlanData.health_profile as any),
          currentWeight: weight
        };
        
        await supabase
          .from('user_health_plans')
          .update({ health_profile: updatedProfile })
          .eq('user_id', user.id);
      }
    }
  };

  // Calculate weight milestones
  const getWeightMilestone = () => {
    if (!currentWeight) return null;
    const targetWeight = currentWeight - 5; // Example: 5kg loss goal
    const progress = Math.max(0, Math.min(100, ((currentWeight - targetWeight) / 5) * 100));
    return {
      target: targetWeight,
      progress: 100 - progress,
      remaining: Math.max(0, currentWeight - targetWeight).toFixed(1)
    };
  };

  const weightMilestone = getWeightMilestone();

  const handleDayNavigation = (direction: 'left' | 'right') => {
    if (direction === 'right' && selectedDay === 'today') {
      setSelectedDay('yesterday');
    } else if (direction === 'left' && selectedDay === 'yesterday') {
      setSelectedDay('today');
    }
  };

  return (
    <>
      {/* Welcome Tour for new users */}
      {showTour && <WelcomeTour onComplete={completeTour} />}
      
      <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto relative">
        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} className="h-0 w-full" />
      
      {/* Sticky Header */}
      <header 
        ref={headerRef}
        className={`pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8 bg-background transition-all duration-300 ${
          isHeaderSticky 
            ? 'sticky top-0 z-50 shadow-md border-b border-border/50 backdrop-blur-sm bg-background/95' 
            : ''
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
              Hi, {(preferredName || profile.name).split(' ')[0]}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Make yourself proud today!</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.streak > 0 && <StreakBadge streak={profile.streak} />}
          </div>
        </motion.div>
      </header>

      {/* AI Plan Card */}
      <AIPlanCard />

      {/* Progress Rings with Day Navigation */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6" delay={0.1}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDayNavigation('left')}
            disabled={selectedDay === 'today'}
            className="h-8 w-8 transition-opacity"
          >
            <ChevronLeft className={`w-5 h-5 ${selectedDay === 'today' ? 'opacity-30' : ''}`} />
          </Button>
          
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={selectedDay}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-base sm:text-lg font-semibold"
              >
                {selectedDay === 'today' ? "Today's Progress" : "Yesterday's Progress"}
              </motion.h2>
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">
              {format(selectedDay === 'today' ? new Date() : subDays(new Date(), 1), 'MMM d, yyyy')}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDayNavigation('right')}
            disabled={selectedDay === 'yesterday'}
            className="h-8 w-8 transition-opacity"
          >
            <ChevronRight className={`w-5 h-5 ${selectedDay === 'yesterday' ? 'opacity-30' : ''}`} />
          </Button>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedDay}
            initial={{ opacity: 0, x: selectedDay === 'yesterday' ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: selectedDay === 'yesterday' ? -50 : 50 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center items-center gap-6"
          >
            <ProgressRing
              progress={waterProgress}
              variant="water"
              label="Water"
              value={`${Math.round(displayWater / 1000 * 10) / 10}L`}
              subLabel={`of ${profile.goals.waterGoal / 1000}L`}
              size={100}
              className="sm:hidden"
            />
            <ProgressRing
              progress={caloriesProgress}
              variant="nutrition"
              label="Calories"
              value={`${displayCalories}`}
              subLabel={`of ${profile.goals.calorieGoal}`}
              size={100}
              className="sm:hidden"
            />
            {/* Larger screens */}
            <ProgressRing
              progress={waterProgress}
              variant="water"
              label="Water"
              value={`${Math.round(displayWater / 1000 * 10) / 10}L`}
              subLabel={`of ${profile.goals.waterGoal / 1000}L`}
              size={140}
              className="hidden sm:flex"
            />
            <ProgressRing
              progress={caloriesProgress}
              variant="nutrition"
              label="Calories"
              value={`${displayCalories}`}
              subLabel={`of ${profile.goals.calorieGoal}`}
              size={140}
              className="hidden sm:flex"
            />
          </motion.div>
        </AnimatePresence>
      </DashboardCard>

      {/* Points */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6 flex justify-center">
        <PointsBadge points={todayPoints} />
      </div>

      {/* Quick Log Section - Three Panel Design */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Log</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Water Card */}
          <motion.button
            onClick={() => setShowQuickAdd(true)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-water/10 via-water/5 to-transparent border border-water/20 hover:border-water/40 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-water/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center text-center gap-1.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-water flex items-center justify-center shadow-water">
                <Droplets className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-base font-semibold text-foreground">Water</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {Math.round(todayWater / 1000 * 10) / 10}L / {profile.goals.waterGoal / 1000}L
                </p>
              </div>
              <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden mt-0.5 sm:mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(waterProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-water rounded-full"
                />
              </div>
            </div>
          </motion.button>

          {/* Calories Card */}
          <motion.button
            onClick={() => navigate('/calories')}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-nutrition/10 via-nutrition/5 to-transparent border border-nutrition/20 hover:border-nutrition/40 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-nutrition/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center text-center gap-1.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-nutrition flex items-center justify-center shadow-nutrition">
                <Utensils className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-base font-semibold text-foreground">Calories</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {todayCalories} / {profile.goals.calorieGoal}
                </p>
              </div>
              <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden mt-0.5 sm:mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(caloriesProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-nutrition rounded-full"
                />
              </div>
            </div>
          </motion.button>

          {/* Weight & Health Card */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 bg-gradient-to-br from-health/10 via-health/5 to-transparent border border-health/20 hover:border-health/40 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-health/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col items-center text-center gap-1.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-health flex items-center justify-center shadow-health">
                <Scale className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-base font-semibold text-foreground">Weight</p>
                {currentWeight ? (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {currentWeight} kg
                  </p>
                ) : (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    Tap to log
                  </p>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="w-full flex gap-1 mt-0.5 sm:mt-1">
                <button
                  onClick={() => setShowWeightInput(true)}
                  className="flex-1 h-6 sm:h-7 text-[9px] sm:text-xs bg-health/20 hover:bg-health/30 text-health rounded-md transition-colors font-medium"
                >
                  Log
                </button>
                <button
                  onClick={() => setShowWeeklySummary(!showWeeklySummary)}
                  className="flex-1 h-6 sm:h-7 text-[9px] sm:text-xs bg-muted hover:bg-muted/80 text-muted-foreground rounded-md transition-colors"
                >
                  {showWeeklySummary ? <ChevronUp className="w-3 h-3 mx-auto" /> : <ChevronDown className="w-3 h-3 mx-auto" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Health Summary Panel */}
        <AnimatePresence>
          {showWeeklySummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-card border border-border">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-health" />
                  Weekly Health Summary
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-health/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-health" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-semibold">{currentWeight ? `${currentWeight} kg` : '--'}</p>
                    </div>
                  </div>
                  {userHeight && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-health/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-health" />
                      </div>
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p className="font-semibold">{userHeight} cm</p>
                      </div>
                    </div>
                  )}
                  {weightMilestone && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Target className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Goal</p>
                          <p className="font-semibold">{weightMilestone.target} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-muted-foreground">To Go</p>
                          <p className="font-semibold">{weightMilestone.remaining} kg</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-3 p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    💡 <span className="font-medium">Tip:</span> Track your weight at the same time each day for consistent results.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weight Input Dialog */}
      <Dialog open={showWeightInput} onOpenChange={setShowWeightInput}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-health" />
              Log Weight
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={currentWeight ? currentWeight.toString() : "Enter weight"}
                className="flex-1 h-12 px-4 text-lg rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-health/50"
                step="0.1"
                min="0"
              />
              <span className="text-muted-foreground font-medium">kg</span>
            </div>
            <Button
              onClick={handleLogWeight}
              disabled={!weightInput}
              className="w-full h-12 bg-gradient-health hover:opacity-90 text-white"
            >
              Save Weight
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Challenges */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6" delay={0.3}>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Daily Challenges</h2>
        <div className="space-y-3">
          <ChallengeItem
            title="Drink 8 glasses of water"
            progress={Math.min(Math.round((todayWater / 2000) * 8), 8)}
            total={8}
            completed={todayWater >= 2000}
            color="water"
          />
          <ChallengeItem
            title="Log all 3 meals"
            progress={getTodayMealsLogged()}
            total={3}
            completed={getTodayMealsLogged() >= 3}
            color="nutrition"
          />
        </div>
      </DashboardCard>

      {/* Progress Charts */}
      <ProgressCharts
        waterLogs={waterLogs}
        foodLogs={foodLogs}
        waterGoal={profile.goals.waterGoal}
        calorieGoal={profile.goals.calorieGoal}
      />

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-water" />
              Quick Add Water
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[250, 500, 750].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleQuickWater(amount)}
                className="h-20 flex flex-col gap-1 hover:bg-water-light hover:border-water"
              >
                <span className="text-lg font-bold">{amount}ml</span>
                <span className="text-xs text-muted-foreground">
                  {amount === 250 ? '1 glass' : amount === 500 ? '2 glasses' : '3 glasses'}
                </span>
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => handleQuickWater(1000)}
              className="h-16 hover:bg-water-light hover:border-water"
            >
              <span className="text-lg font-bold">1L</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/water')}
              className="h-16"
            >
              <span className="text-sm">More options →</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

interface ChallengeItemProps {
  title: string;
  progress: number;
  total: number;
  completed: boolean;
  color: 'water' | 'nutrition';
}

function ChallengeItem({ title, progress, total, completed, color }: ChallengeItemProps) {
  const colorClasses = {
    water: 'bg-water',
    nutrition: 'bg-nutrition',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : ''}`}>
            {title}
          </span>
          <span className="text-xs text-muted-foreground">
            {progress}/{total}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full rounded-full ${colorClasses[color]}`}
          />
        </div>
      </div>
      {completed && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-lg"
        >
          ✓
        </motion.span>
      )}
    </div>
  );
}
