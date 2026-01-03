import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Droplets, Utensils, Dumbbell, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '@/components/ProgressRing';
import { QuickLogButton } from '@/components/QuickLogButton';
import { StreakBadge } from '@/components/StreakBadge';
import { PointsBadge } from '@/components/PointsBadge';
import { DashboardCard } from '@/components/DashboardCard';
import { HabitsSection } from '@/components/HabitsSection';
import { ProgressCharts } from '@/components/ProgressCharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIPlanCard } from '@/components/AIPlanCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useHealthCoach } from '@/hooks/useHealthCoach';
import { motivationalQuotes } from '@/data/foodDatabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Dashboard() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const {
    profile,
    habits,
    waterLogs,
    foodLogs,
    fitnessLogs,
    getTodayWater,
    getTodayCalories,
    getTodayFitness,
    getTodayPoints,
    addWater,
    addHabit,
    deleteHabit,
    logHabit,
    getTodayHabitProgress,
  } = useWellnessData();

  const {
    healthProfile,
    healthPlan,
    isLoading: isGenerating,
    generatePlan,
    saveProfile,
  } = useHealthCoach();

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const handleGeneratePlan = async () => {
    if (healthProfile) {
      await generatePlan(healthProfile);
    }
  };

  const todayWater = getTodayWater();
  const todayCalories = getTodayCalories();
  const todayFitness = getTodayFitness();
  const todayPoints = getTodayPoints();

  const waterProgress = (todayWater / profile.goals.waterGoal) * 100;
  const caloriesProgress = (todayCalories / profile.goals.calorieGoal) * 100;
  const fitnessProgress = (todayFitness / 30) * 100;

  const handleQuickWater = (amount: number) => {
    addWater(amount);
    setShowQuickAdd(false);
  };

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto relative">
      {/* Header */}
      <header className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8">
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
              Hi, {profile.name.split(' ')[0]}! 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile.streak > 0 && <StreakBadge streak={profile.streak} />}
          </div>
        </motion.div>
      </header>

      {/* AI Plan Card */}
      <AIPlanCard
        plan={healthPlan}
        profile={healthProfile}
        isLoading={isGenerating}
        onGeneratePlan={handleGeneratePlan}
      />

      {/* Progress Rings */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6" delay={0.1}>
        <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-center">Today's Progress</h2>
        <div className="flex justify-around items-center gap-2">
          <ProgressRing
            progress={waterProgress}
            variant="water"
            label="Water"
            value={`${Math.round(todayWater / 1000 * 10) / 10}L`}
            subLabel={`of ${profile.goals.waterGoal / 1000}L`}
            size={80}
            className="sm:hidden"
          />
          <ProgressRing
            progress={caloriesProgress}
            variant="nutrition"
            label="Calories"
            value={`${todayCalories}`}
            subLabel={`of ${profile.goals.calorieGoal}`}
            size={100}
            className="sm:hidden"
          />
          <ProgressRing
            progress={fitnessProgress}
            variant="fitness"
            label="Fitness"
            value={`${todayFitness}m`}
            subLabel="of 30 min"
            size={80}
            className="sm:hidden"
          />
          {/* Larger screens */}
          <ProgressRing
            progress={waterProgress}
            variant="water"
            label="Water"
            value={`${Math.round(todayWater / 1000 * 10) / 10}L`}
            subLabel={`of ${profile.goals.waterGoal / 1000}L`}
            size={120}
            className="hidden sm:flex"
          />
          <ProgressRing
            progress={caloriesProgress}
            variant="nutrition"
            label="Calories"
            value={`${todayCalories}`}
            subLabel={`of ${profile.goals.calorieGoal}`}
            size={160}
            className="hidden sm:flex"
          />
          <ProgressRing
            progress={fitnessProgress}
            variant="fitness"
            label="Fitness"
            value={`${todayFitness}m`}
            subLabel="of 30 min"
            size={120}
            className="hidden sm:flex"
          />
        </div>
      </DashboardCard>

      {/* Points */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6 flex justify-center">
        <PointsBadge points={todayPoints} />
      </div>

      {/* Quick Log Section */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Log</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <QuickLogButton
            icon={Droplets}
            label="Water"
            variant="water"
            onClick={() => setShowQuickAdd(true)}
          />
          <QuickLogButton
            icon={Utensils}
            label="Meal"
            variant="nutrition"
            onClick={() => navigate('/calories')}
          />
          <QuickLogButton
            icon={Dumbbell}
            label="Workout"
            variant="fitness"
            onClick={() => navigate('/fitness')}
          />
        </div>
      </div>

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
            progress={Math.min(3, 3)}
            total={3}
            completed={false}
            color="nutrition"
          />
          <ChallengeItem
            title="30 minutes of activity"
            progress={Math.min(todayFitness, 30)}
            total={30}
            completed={todayFitness >= 30}
            color="fitness"
          />
        </div>
      </DashboardCard>

      {/* Custom Habits */}
      <HabitsSection
        habits={habits}
        addHabit={addHabit}
        deleteHabit={deleteHabit}
        logHabit={logHabit}
        getTodayHabitProgress={getTodayHabitProgress}
      />

      {/* Progress Charts */}
      <ProgressCharts
        waterLogs={waterLogs}
        foodLogs={foodLogs}
        fitnessLogs={fitnessLogs}
        waterGoal={profile.goals.waterGoal}
        calorieGoal={profile.goals.calorieGoal}
      />

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-5 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

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
  );
}

interface ChallengeItemProps {
  title: string;
  progress: number;
  total: number;
  completed: boolean;
  color: 'water' | 'nutrition' | 'fitness';
}

function ChallengeItem({ title, progress, total, completed, color }: ChallengeItemProps) {
  const colorClasses = {
    water: 'bg-water',
    nutrition: 'bg-nutrition',
    fitness: 'bg-fitness',
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
