import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { 
  Droplets, 
  Utensils, 
  Heart, 
  Camera, 
  Apple,
  TrendingUp,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreakBadge } from '@/components/StreakBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { WelcomeTour, useTourStatus } from '@/components/WelcomeTour';
import { WellnessCheckPage } from '@/components/WellnessCheck';

// Daily challenge tips for random AI-generated suggestions
const CHALLENGE_TIPS = [
  "Try: Greek yogurt or lentils",
  "Try: Grilled chicken or cottage cheese",
  "Try: Eggs or tofu scramble",
  "Try: Salmon or tempeh",
  "Try: Quinoa bowl with chickpeas",
  "Try: Protein smoothie with nut butter",
  "Try: Black beans or edamame",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [showWeeklyDetails, setShowWeeklyDetails] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  const {
    profile,
    waterLogs,
    foodLogs,
    getTodayWater,
    getTodayCalories,
    getTodayMeals,
    addWater,
  } = useWellnessData();

  const { healthPlan } = useUserPlan();
  const { displayName } = useUserProfile();
  const { showTour, completeTour } = useTourStatus();

  // Random tip for challenge
  const challengeTip = useMemo(() => 
    CHALLENGE_TIPS[Math.floor(Math.random() * CHALLENGE_TIPS.length)], 
  []);

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

  const todayWater = getTodayWater();
  const todayCalories = getTodayCalories();
  const todayMeals = getTodayMeals();

  // Calculate today's macros from food logs
  const todayMacros = useMemo(() => {
    return todayMeals.reduce(
      (acc, log) => ({
        protein: acc.protein + (log.foodItem.protein || 0),
        carbs: acc.carbs + (log.foodItem.carbs || 0),
        fat: acc.fat + (log.foodItem.fat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayMeals]);

  // Goals
  const calorieGoal = healthPlan?.dailyCalories || profile.goals.calorieGoal;
  const waterGoal = profile.goals.waterGoal;
  const proteinGoal = healthPlan?.macros?.protein || 90;

  // Progress percentages
  const calorieProgress = Math.min((todayCalories / calorieGoal) * 100, 100);
  const waterProgress = Math.min((todayWater / waterGoal) * 100, 100);
  const proteinProgress = Math.min((todayMacros.protein / proteinGoal) * 100, 100);

  // Weekly data calculations
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(weekEnd, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayWater = waterLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.amount, 0);
      
      const dayCalories = foodLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.foodItem.calories, 0);
      
      days.push({
        day: format(date, 'EEE'),
        water: dayWater,
        calories: dayCalories,
        waterPercent: Math.min((dayWater / waterGoal) * 100, 100),
        caloriePercent: Math.min((dayCalories / calorieGoal) * 100, 100),
      });
    }
    return days;
  }, [waterLogs, foodLogs, waterGoal, calorieGoal]);

  // Weekly insight
  const weeklyInsight = useMemo(() => {
    const waterDaysComplete = weeklyData.filter(d => d.waterPercent >= 80).length;
    const calorieDaysComplete = weeklyData.filter(d => d.caloriePercent >= 50 && d.caloriePercent <= 110).length;
    
    if (waterDaysComplete >= 5) {
      return "You've been consistent with water! 💧";
    } else if (calorieDaysComplete >= 5) {
      return "Great calorie tracking this week! 🎯";
    } else {
      return "Keep building those healthy habits! 💪";
    }
  }, [weeklyData]);

  const handleQuickWater = (amount: number) => {
    addWater(amount);
    setShowQuickAdd(false);
  };

  const handleMarkChallengeComplete = () => {
    setChallengeCompleted(true);
  };

  return (
    <>
      {showTour && <WelcomeTour onComplete={completeTour} />}
      
      <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto relative">
        {/* Sentinel for sticky detection */}
        <div ref={sentinelRef} className="h-0 w-full" />
      
        {/* Sticky Header */}
        <header 
          ref={headerRef}
          className={`pt-4 sm:pt-6 pb-3 px-4 sm:px-5 md:px-8 bg-background transition-all duration-300 ${
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
                Hi, {displayName.split(' ')[0]}! 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {profile.streak > 0 && <StreakBadge streak={profile.streak} />}
            </div>
          </motion.div>
        </header>

        {/* Fixed Quick Actions Bar */}
        <div className="px-4 sm:px-5 md:px-8 py-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4 p-3 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/calories')}
              className="w-12 h-12 rounded-xl bg-gradient-nutrition flex items-center justify-center shadow-nutrition transition-all hover:shadow-lg"
              title="Scan Food"
            >
              <Camera className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuickAdd(true)}
              className="w-12 h-12 rounded-xl bg-gradient-water flex items-center justify-center shadow-water transition-all hover:shadow-lg"
              title="Log Water"
            >
              <Droplets className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/calories')}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg transition-all hover:shadow-xl"
              title="Log Meal"
            >
              <Apple className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWellnessCheck(true)}
              className="w-12 h-12 rounded-xl bg-gradient-health flex items-center justify-center shadow-health transition-all hover:shadow-lg"
              title="Wellness Check"
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.button>
          </motion.div>
        </div>

        {/* Scrollable Cards */}
        <div className="px-4 sm:px-5 md:px-8 space-y-4 pb-6">
          
          {/* Card 1: Daily Health Snapshot */}
          <DashboardCard delay={0.15}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              DAILY HEALTH SNAPSHOT
            </h2>
            
            {/* Calories Section */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-nutrition/20 flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-nutrition" />
                  </div>
                  <span className="font-medium">Calories</span>
                </div>
                <span className="text-sm font-semibold">
                  {todayCalories} / {calorieGoal} cal
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calorieProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-nutrition rounded-full"
                />
              </div>
              
              {/* Macro breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-red-500/10">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="text-sm font-bold text-red-500">{Math.round(todayMacros.protein)}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="text-sm font-bold text-amber-500">{Math.round(todayMacros.carbs)}g</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="text-sm font-bold text-blue-500">{Math.round(todayMacros.fat)}g</p>
                </div>
              </div>
            </div>
            
            {/* Water Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-water/20 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-water" />
                  </div>
                  <span className="font-medium">Water</span>
                </div>
                <span className="text-sm font-semibold">
                  {Math.round(todayWater / 1000 * 10) / 10}L / {waterGoal / 1000}L
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${waterProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className="h-full bg-gradient-water rounded-full"
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              Tap to log →
            </p>
          </DashboardCard>

          {/* Card 2: AI Nutrition Plan */}
          <DashboardCard delay={0.2}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              🤖 YOUR DAILY PLAN
            </h2>
            
            {healthPlan ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="text-center p-3 rounded-xl bg-primary/10">
                    <p className="text-xl font-bold text-primary">{healthPlan.dailyCalories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-amber-500/10">
                    <p className="text-lg font-bold">{healthPlan.macros.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-500/10">
                    <p className="text-lg font-bold">{healthPlan.macros.protein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-500/10">
                    <p className="text-lg font-bold">{healthPlan.macros.fats}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Based on your goals & patterns
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/profile')}
                >
                  Adjust Plan
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Complete onboarding to get your personalized plan
                </p>
                <Button size="sm" onClick={() => navigate('/profile')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            )}
          </DashboardCard>

          {/* Card 3: Today's Focus Challenge */}
          <DashboardCard delay={0.25}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              TODAY'S FOCUS CHALLENGE
            </h2>
            
            <div className={`p-4 rounded-xl border-2 transition-all ${
              challengeCompleted 
                ? 'bg-nutrition/10 border-nutrition/30' 
                : 'bg-muted/30 border-border'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">
                    Reach {proteinGoal}g Protein
                  </h3>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">+25 Points</span>
                  </div>
                </div>
                {challengeCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-nutrition flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              
              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{Math.round(todayMacros.protein)}g logged</span>
                  <span>{proteinGoal}g goal</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${proteinProgress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-nutrition to-green-500 rounded-full"
                  />
                </div>
              </div>
              
              {/* AI Tip */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50 mb-3">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{challengeTip}</p>
              </div>
              
              <Button 
                size="sm" 
                className="w-full"
                variant={challengeCompleted ? "secondary" : "default"}
                onClick={handleMarkChallengeComplete}
                disabled={challengeCompleted}
              >
                {challengeCompleted ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Completed!
                  </>
                ) : (
                  'Mark Complete'
                )}
              </Button>
            </div>
          </DashboardCard>

          {/* Card 4: Weekly Trends */}
          <DashboardCard delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                📈 YOUR PROGRESS TRENDS
              </h2>
              <button
                onClick={() => setShowWeeklyDetails(!showWeeklyDetails)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                {showWeeklyDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Calories Bar Graph */}
            <div className="mb-4">
              <p className="text-xs font-medium mb-2">Calories</p>
              <div className="flex items-end gap-1 h-16">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(day.caloriePercent * 0.6, 4)}px` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="w-full rounded-t bg-gradient-nutrition"
                      style={{ maxHeight: '48px' }}
                    />
                    <span className="text-[10px] text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Water Bar Graph */}
            <div className="mb-4">
              <p className="text-xs font-medium mb-2">Water</p>
              <div className="flex items-end gap-1 h-16">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(day.waterPercent * 0.6, 4)}px` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="w-full rounded-t bg-gradient-water"
                      style={{ maxHeight: '48px' }}
                    />
                    <span className="text-[10px] text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key Insight */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-sm">{weeklyInsight}</p>
            </div>
            
            {/* Expanded Details */}
            <AnimatePresence>
              {showWeeklyDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-nutrition/10">
                        <p className="text-xs text-muted-foreground">Avg Calories</p>
                        <p className="text-lg font-bold">
                          {Math.round(weeklyData.reduce((s, d) => s + d.calories, 0) / 7)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-water/10">
                        <p className="text-xs text-muted-foreground">Avg Water</p>
                        <p className="text-lg font-bold">
                          {(weeklyData.reduce((s, d) => s + d.water, 0) / 7 / 1000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Report
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DashboardCard>
        </div>

        {/* Wellness Check Full Screen */}
        <AnimatePresence>
          {showWellnessCheck && (
            <WellnessCheckPage onClose={() => setShowWellnessCheck(false)} />
          )}
        </AnimatePresence>

        {/* Quick Add Water Dialog */}
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
                  className="h-20 flex flex-col gap-1 hover:bg-water/10 hover:border-water"
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
                className="h-16 hover:bg-water/10 hover:border-water"
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
