import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreakBadge } from '@/components/StreakBadge';
import { PointsBadge } from '@/components/PointsBadge';
import { ProgressCharts } from '@/components/ProgressCharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIPlanCard } from '@/components/AIPlanCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { useUserProfile } from '@/contexts/UserProfileContext';
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
import { WellnessCheckPage } from '@/components/WellnessCheck';
import { TodaysFocus } from '@/components/TodaysFocus';
import { JourneyMap } from '@/components/JourneyMap';

export default function Dashboard() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'today' | 'yesterday'>('today');
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
  
  // Use centralized user profile context for displayName
  const { displayName } = useUserProfile();
  const { showTour, completeTour } = useTourStatus();
  
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);
  // Fetch health data (weight/height) from health plans
  useEffect(() => {
    const fetchHealthData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: healthPlanData } = await supabase
          .from('user_health_plans')
          .select('health_profile')
          .eq('user_id', user.id)
          .single();
        
        if (healthPlanData) {
          const healthProfile = healthPlanData.health_profile as any;
          
          if (healthProfile?.currentWeight) {
            setCurrentWeight(healthProfile.currentWeight);
          }
        }
      }
    };
    fetchHealthData();
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

  const handleDayNavigation = (direction: 'left' | 'right') => {
    if (direction === 'right' && selectedDay === 'today') {
      setSelectedDay('yesterday');
    } else if (direction === 'left' && selectedDay === 'yesterday') {
      setSelectedDay('today');
    }
  };

  const handleQuickWater = (amount: number) => {
    addWater(amount);
    setShowQuickAdd(false);
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
              Hi, {displayName.split(' ')[0]}! 👋
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

      {/* Journey Map - Visual Progress */}
      <div className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6">
        <JourneyMap
          waterProgress={waterProgress}
          caloriesProgress={caloriesProgress}
          wellnessProgress={75}
          waterValue={`${Math.round(todayWater / 1000 * 10) / 10}L / ${profile.goals.waterGoal / 1000}L`}
          caloriesValue={`${todayCalories} / ${profile.goals.calorieGoal}`}
          wellnessValue={currentWeight ? `${currentWeight} kg` : 'Log now'}
          onWaterClick={() => setShowQuickAdd(true)}
          onWellnessClick={() => setShowWellnessCheck(true)}
        />
      </div>

      {/* Points */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6 flex justify-center">
        <PointsBadge points={todayPoints} />
      </div>

      {/* Wellness Check Full Screen */}
      <AnimatePresence>
        {showWellnessCheck && (
          <WellnessCheckPage onClose={() => setShowWellnessCheck(false)} />
        )}
      </AnimatePresence>


      {/* Today's Focus - Macro Targets */}
      <div className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6">
        <TodaysFocus />
      </div>

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
