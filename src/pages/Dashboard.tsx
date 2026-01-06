import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Droplets, Heart, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WelcomeTour, useTourStatus } from '@/components/WelcomeTour';
import { ThemeToggle } from '@/components/ThemeToggle';
import { JourneyPath, ProgressTrends, ThemeDropdown, JourneyData, ArchitectureStyle } from '@/components/journey';

const THEME_STORAGE_KEY = 'journey-theme';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [theme, setTheme] = useState<ArchitectureStyle>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as ArchitectureStyle) || 'nature';
  });

  const {
    profile,
    waterLogs,
    foodLogs,
    getTodayWater,
    getTodayCalories,
    addWater,
  } = useWellnessData();

  useUserPlan();
  const { showTour, completeTour } = useTourStatus();

  const todayWater = getTodayWater();
  const todayCalories = getTodayCalories();

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Generate 7-day history
  const journeyData: JourneyData = useMemo(() => {
    const today = new Date();
    const waterHistory: { date: string; value: number }[] = [];
    const caloriesHistory: { date: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayWater = waterLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.amount, 0);

      const dayCalories = foodLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.foodItem.calories, 0);

      waterHistory.push({ date: dateStr, value: dayWater });
      caloriesHistory.push({ date: dateStr, value: dayCalories });
    }

    return {
      water: {
        current: todayWater,
        goal: profile.goals.waterGoal,
        progress: Math.min((todayWater / profile.goals.waterGoal) * 100, 100),
        history: waterHistory,
      },
      calories: {
        current: todayCalories,
        goal: profile.goals.calorieGoal,
        progress: Math.min((todayCalories / profile.goals.calorieGoal) * 100, 100),
        history: caloriesHistory,
      },
    };
  }, [waterLogs, foodLogs, todayWater, todayCalories, profile.goals]);

  const handleQuickWater = (amount: number) => {
    addWater(amount);
    setShowQuickAdd(false);
  };

  return (
    <>
      {showTour && <WelcomeTour onComplete={completeTour} />}

      <div className="h-full w-full flex flex-col bg-background overflow-hidden">
        {/* Header - Date, Streak, Dark Mode, Wellness */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <motion.p
              className="text-sm font-medium text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {format(new Date(), 'EEEE, MMMM d')}
            </motion.p>
            
            {/* Streak Badge */}
            {profile.streak > 0 && (
              <motion.div 
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-streak/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Flame className="w-3 h-3 text-streak" />
                <span className="text-xs font-bold text-streak">{profile.streak}</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={() => navigate('/wellness')}
              className="w-9 h-9 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Heart className="w-6 h-6 text-destructive fill-destructive" />
            </motion.button>
          </div>
        </header>

        {/* Section 1: Today's Journey (60%) */}
        <div className="flex-1 min-h-0 px-4 pb-2" style={{ flex: '0 0 55%' }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-foreground">Today's Journey</h2>
            <ThemeDropdown current={theme} onChange={setTheme} />
          </div>
          
          <div className="h-[calc(100%-2rem)]">
            <JourneyPath
              data={journeyData}
              theme={theme}
              onWaterClick={() => setShowQuickAdd(true)}
              onCaloriesClick={() => navigate('/calories')}
            />
          </div>
        </div>

        {/* Section 2: Progress Trends (40%) */}
        <div className="flex-1 min-h-0 px-4 pb-4" style={{ flex: '0 0 40%' }}>
          <ProgressTrends data={journeyData} />
        </div>

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