import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Droplets, Utensils, Scale, TrendingUp, ChevronRight, Sparkles, Flame, Target, Plus, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressCharts } from '@/components/ProgressCharts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AIPlanCard } from '@/components/AIPlanCard';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [preferredName, setPreferredName] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
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

  useUserPlan();
  const { showTour, completeTour } = useTourStatus();

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
    fetchUserData();
  }, []);

  const todayWater = getTodayWater();
  const todayCalories = getTodayCalories();
  const todayPoints = getTodayPoints();
  const todayMeals = getTodayMeals();

  const getTodayMealsLogged = useCallback(() => {
    const mealTypes = new Set(todayMeals.map(meal => meal.mealType));
    return ['breakfast', 'lunch', 'dinner'].filter(type => mealTypes.has(type as any)).length;
  }, [todayMeals]);

  const waterProgress = Math.min((todayWater / profile.goals.waterGoal) * 100, 100);
  const caloriesProgress = Math.min((todayCalories / profile.goals.calorieGoal) * 100, 100);

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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {showTour && <WelcomeTour onComplete={completeTour} />}
      
      <div className="min-h-full bg-background pb-24">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{greeting()}</p>
              <h1 className="text-2xl font-bold text-foreground">
                {(preferredName || profile.name).split(' ')[0]}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {profile.streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 text-accent">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-semibold">{profile.streak}</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="px-5 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMM d')}</span>
              <div className="flex items-center gap-1.5 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">{todayPoints} pts</span>
              </div>
            </div>

            {/* Three Metric Bars */}
            <div className="space-y-4">
              {/* Water */}
              <button 
                onClick={() => setShowQuickAdd(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-water/10 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-water" />
                    </div>
                    <span className="font-medium">Water</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {(todayWater / 1000).toFixed(1)}L / {(profile.goals.waterGoal / 1000)}L
                    </span>
                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-water transition-colors" />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${waterProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-water rounded-full"
                  />
                </div>
              </button>

              {/* Calories */}
              <button 
                onClick={() => navigate('/calories')}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-nutrition/10 flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-nutrition" />
                    </div>
                    <span className="font-medium">Calories</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {todayCalories} / {profile.goals.calorieGoal}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-nutrition transition-colors" />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${caloriesProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className="h-full bg-nutrition rounded-full"
                  />
                </div>
              </button>

              {/* Weight */}
              <button 
                onClick={() => setShowWeightInput(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-health/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-health" />
                    </div>
                    <span className="font-medium">Weight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {currentWeight ? `${currentWeight} kg` : 'Not logged'}
                    </span>
                    <Plus className="w-4 h-4 text-muted-foreground group-hover:text-health transition-colors" />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-health/30 rounded-full w-full" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* AI Plan - Collapsible */}
        <div className="px-5 mb-4">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'ai' ? null : 'ai')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">AI Health Plan</p>
                <p className="text-xs text-muted-foreground">Your personalized insights</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'ai' ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {expandedSection === 'ai' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <AIPlanCard />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Daily Challenges */}
        <div className="px-5 mb-4">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'challenges' ? null : 'challenges')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Daily Challenges</p>
                <p className="text-xs text-muted-foreground">
                  {Math.min(Math.round((todayWater / 2000) * 8), 8) >= 8 && getTodayMealsLogged() >= 3 
                    ? 'All complete!' 
                    : `${(Math.min(Math.round((todayWater / 2000) * 8), 8) >= 8 ? 1 : 0) + (getTodayMealsLogged() >= 3 ? 1 : 0)}/2 completed`}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'challenges' ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {expandedSection === 'challenges' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 mt-2 rounded-xl bg-card border border-border space-y-3">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Trends */}
        <div className="px-5 mb-4">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'trends' ? null : 'trends')}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-water/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-water" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Progress Trends</p>
                <p className="text-xs text-muted-foreground">Weekly overview</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSection === 'trends' ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {expandedSection === 'trends' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <ProgressCharts
                    waterLogs={waterLogs}
                    foodLogs={foodLogs}
                    waterGoal={profile.goals.waterGoal}
                    calorieGoal={profile.goals.calorieGoal}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Add Water Dialog */}
        <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-water" />
                Add Water
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[250, 500, 750].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => handleQuickWater(amount)}
                  className="h-16 flex flex-col gap-0.5 hover:bg-water/10 hover:border-water"
                >
                  <span className="font-bold">{amount}ml</span>
                  <span className="text-[10px] text-muted-foreground">
                    {amount === 250 ? '1 glass' : amount === 500 ? '2 glasses' : '3 glasses'}
                  </span>
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/water')}
              className="w-full mt-2"
            >
              More options
            </Button>
          </DialogContent>
        </Dialog>

        {/* Weight Input Dialog */}
        <Dialog open={showWeightInput} onOpenChange={setShowWeightInput}>
          <DialogContent className="sm:max-w-sm">
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
                className="w-full h-11 bg-health hover:bg-health/90 text-white"
              >
                Save
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
  const colorClass = color === 'water' ? 'bg-water' : 'bg-nutrition';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-sm ${completed ? 'line-through text-muted-foreground' : ''}`}>
            {title}
          </span>
          <span className="text-xs text-muted-foreground">{progress}/{total}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${colorClass}`}
          />
        </div>
      </div>
      {completed && <span className="text-sm">✓</span>}
    </div>
  );
}
