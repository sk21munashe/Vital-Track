import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Target, Trophy, Star, Flame, Droplets, Utensils, Dumbbell, Edit2, LogOut, Gift, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/DashboardCard';
import { useWellnessData } from '@/hooks/useWellnessData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AchievementProgress } from '@/components/AchievementProgress';
import { TierRanking } from '@/components/TierRanking';
import { DailyRewards } from '@/components/DailyRewards';

interface ProfileProps {
  onSignOut?: () => void;
}

const achievementDefinitions = [
  { id: 'hydration_hero', name: 'Hydration Hero', description: 'Drink 2L of water for 7 days', icon: '💧', category: 'water' as const, requirement: 7 },
  { id: 'meal_master', name: 'Meal Master', description: 'Log 100 meals', icon: '🍽️', category: 'nutrition' as const, requirement: 100 },
  { id: 'fitness_warrior', name: 'Fitness Warrior', description: 'Complete 150 min of activity in a week', icon: '💪', category: 'fitness' as const, requirement: 150 },
  { id: 'streak_starter', name: 'Streak Starter', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak' as const, requirement: 7 },
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all daily goals', icon: '⭐', category: 'streak' as const, requirement: 1 },
  { id: 'point_collector', name: 'Point Collector', description: 'Earn 500 total points', icon: '🏆', category: 'streak' as const, requirement: 500 },
  { id: 'water_week', name: 'Water Week', description: 'Log water every day for a week', icon: '🌊', category: 'water' as const, requirement: 7 },
  { id: 'marathon', name: 'Marathon Month', description: 'Log 30 workouts in a month', icon: '🏃', category: 'fitness' as const, requirement: 30 },
];

export default function Profile({ onSignOut }: ProfileProps) {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState({ water: '', calories: '', fitness: '' });

  const { 
    profile, 
    updateProfile, 
    updateGoals, 
    getTodayPoints,
    waterLogs,
    foodLogs,
    fitnessLogs,
    habits,
    habitLogs,
    getTodayWater,
    getTodayCalories,
    getTodayFitness,
    getWeekFitnessMinutes,
    checkDailyCompletion
  } = useWellnessData();

  // Calculate achievement progress
  const today = new Date().toISOString().split('T')[0];
  const todayWaterLogs = waterLogs.filter(l => l.date === today).length;
  const todayMealLogs = foodLogs.filter(l => l.date === today).length;
  const todayFitnessLogs = fitnessLogs.filter(l => l.date === today).length;
  const todayHabitsCompleted = habitLogs.filter(l => l.date === today).length;
  
  const allGoalsComplete = 
    getTodayWater() >= profile.goals.waterGoal &&
    todayMealLogs >= 3 &&
    getTodayFitness() >= 30;

  // Calculate current progress for achievements
  const achievementsWithProgress = achievementDefinitions.map(a => {
    let current = 0;
    switch (a.id) {
      case 'hydration_hero':
      case 'water_week':
        // Count consecutive days with water goal met (simplified)
        current = profile.streak > 0 ? Math.min(profile.streak, a.requirement) : (getTodayWater() >= profile.goals.waterGoal ? 1 : 0);
        break;
      case 'meal_master':
        current = foodLogs.length;
        break;
      case 'fitness_warrior':
        current = getWeekFitnessMinutes();
        break;
      case 'streak_starter':
        current = profile.streak;
        break;
      case 'perfect_day':
        current = allGoalsComplete ? 1 : 0;
        break;
      case 'point_collector':
        current = profile.totalPoints;
        break;
      case 'marathon':
        current = fitnessLogs.length;
        break;
      default:
        current = 0;
    }
    return { ...a, current };
  });

  const handleUpdateProfile = () => {
    if (editName.trim()) {
      updateProfile({ name: editName.trim() });
      setShowEditProfile(false);
      toast.success('Profile updated!');
    }
  };

  const handleUpdateGoals = () => {
    const water = editGoals.water ? parseInt(editGoals.water) : profile.goals.waterGoal;
    const calories = editGoals.calories ? parseInt(editGoals.calories) : profile.goals.calorieGoal;
    const fitness = editGoals.fitness ? parseInt(editGoals.fitness) : profile.goals.fitnessGoal;

    updateGoals({ waterGoal: water, calorieGoal: calories, fitnessGoal: fitness });
    setShowEditGoals(false);
    toast.success('Goals updated!');
  };

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto">
      {/* Header */}
      <header className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">Profile</h1>
          </div>
          {onSignOut && (
            <Button variant="ghost" size="sm" onClick={onSignOut} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          )}
        </div>
      </header>

      {/* Profile Card */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold truncate">{profile.name}</h2>
              <button
                onClick={() => {
                  setEditName(profile.name);
                  setShowEditProfile(true);
                }}
                className="p-1 rounded hover:bg-muted flex-shrink-0"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium">{profile.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium">{profile.totalPoints} pts</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Stats Cards */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Today's Points</h2>
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-3xl sm:text-4xl font-bold"
          >
            {getTodayPoints()}
          </motion.div>
          <p className="text-xs sm:text-sm opacity-90 mt-1">points earned today</p>
        </div>
      </div>

      {/* Goals Section */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Daily Goals
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditGoals({
                water: profile.goals.waterGoal.toString(),
                calories: profile.goals.calorieGoal.toString(),
                fitness: profile.goals.fitnessGoal.toString(),
              });
              setShowEditGoals(true);
            }}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <DashboardCard className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-water-light flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-water" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">Water Intake</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Daily hydration goal</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-water">{profile.goals.waterGoal / 1000}L</span>
          </DashboardCard>

          <DashboardCard className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-nutrition-light flex items-center justify-center">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-nutrition" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">Calories</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Daily calorie target</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-nutrition">{profile.goals.calorieGoal}</span>
          </DashboardCard>

          <DashboardCard className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-fitness-light flex items-center justify-center">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-fitness" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">Fitness</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Weekly activity minutes</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-fitness">{profile.goals.fitnessGoal}m</span>
          </DashboardCard>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="px-4 sm:px-5 md:px-8 pb-6">
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="achievements" className="text-xs sm:text-sm">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-xs sm:text-sm">
              <Gift className="w-3.5 h-3.5 mr-1" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="ranking" className="text-xs sm:text-sm">
              <Crown className="w-3.5 h-3.5 mr-1" />
              Ranking
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="mt-0">
            <AchievementProgress 
              achievements={achievementsWithProgress} 
              unlockedIds={profile.achievements || []} 
            />
          </TabsContent>
          
          <TabsContent value="rewards" className="mt-0">
            <DailyRewards
              waterLogs={todayWaterLogs}
              mealLogs={todayMealLogs}
              fitnessLogs={todayFitnessLogs}
              habitsCompleted={todayHabitsCompleted}
              allGoalsComplete={allGoalsComplete}
            />
          </TabsContent>
          
          <TabsContent value="ranking" className="mt-0">
            <TierRanking totalPoints={profile.totalPoints} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goals Dialog */}
      <Dialog open={showEditGoals} onOpenChange={setShowEditGoals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Daily Water Goal (ml)</Label>
              <Input
                type="number"
                value={editGoals.water}
                onChange={(e) => setEditGoals(prev => ({ ...prev, water: e.target.value }))}
                placeholder="e.g., 2000"
              />
            </div>
            <div>
              <Label>Daily Calorie Goal</Label>
              <Input
                type="number"
                value={editGoals.calories}
                onChange={(e) => setEditGoals(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="e.g., 2000"
              />
            </div>
            <div>
              <Label>Weekly Fitness Goal (minutes)</Label>
              <Input
                type="number"
                value={editGoals.fitness}
                onChange={(e) => setEditGoals(prev => ({ ...prev, fitness: e.target.value }))}
                placeholder="e.g., 150"
              />
            </div>
            <Button onClick={handleUpdateGoals} className="w-full">
              Save Goals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
