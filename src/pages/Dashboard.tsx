import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Droplets, Heart } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { WelcomeTour, useTourStatus } from '@/components/WelcomeTour';

import { ImmersiveJourney, JourneyData } from '@/components/journey';
import { ImmersiveFocus } from '@/components/journey/ImmersiveFocus';
import { FloatingActions } from '@/components/journey/FloatingActions';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const [challengeCompleted, setChallengeCompleted] = useState(false);

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

  const handleChallengeComplete = () => {
    setChallengeCompleted(true);
  };

  return (
    <>
      {showTour && <WelcomeTour onComplete={completeTour} />}

      <div className="h-full w-full flex flex-col bg-background overflow-hidden relative">
        {/* Minimal Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
          <motion.p
            className="text-xs text-muted-foreground font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {format(new Date(), 'EEEE, MMMM d')}
          </motion.p>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.button
              onClick={() => navigate('/wellness')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
            </motion.button>
          </div>
        </header>

        {/* Immersive Journey Visualization - 80% of screen */}
        <div className="flex-1 relative min-h-0">
          <ImmersiveJourney
            data={journeyData}
            onWaterClick={() => setShowQuickAdd(true)}
            onCaloriesClick={() => navigate('/calories')}
          />
        </div>

        {/* Today's Focus - Bottom 20% */}
        <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <motion.div
            className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Today&apos;s Focus</p>
            <ImmersiveFocus
              challenge={{
                id: '1',
                emoji: '🎯',
                title: journeyData.water.progress >= 100 ? 'Water goal achieved!' : 'Reach your water goal',
                points: 25,
                completed: challengeCompleted || journeyData.water.progress >= 100,
              }}
              onComplete={handleChallengeComplete}
            />
          </motion.div>
        </div>

        {/* Floating Quick Actions */}
        <FloatingActions
          onScanFood={() => navigate('/calories')}
          onLogWater={() => setShowQuickAdd(true)}
        />


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
