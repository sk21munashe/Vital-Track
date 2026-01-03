import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Target, Trophy, Star, Flame, Droplets, Utensils, Dumbbell, Edit2, Settings } from 'lucide-react';
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
import { toast } from 'sonner';

const achievements = [
  { id: 'hydration_hero', name: 'Hydration Hero', description: 'Drink 2L of water for 7 days', icon: '💧', category: 'water' },
  { id: 'meal_master', name: 'Meal Master', description: 'Log 100 meals', icon: '🍽️', category: 'nutrition' },
  { id: 'fitness_warrior', name: 'Fitness Warrior', description: 'Complete 150 min of activity in a week', icon: '💪', category: 'fitness' },
  { id: 'streak_starter', name: 'Streak Starter', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak' },
  { id: 'perfect_day', name: 'Perfect Day', description: 'Complete all daily goals', icon: '⭐', category: 'streak' },
  { id: 'early_bird', name: 'Early Bird', description: 'Log breakfast before 9 AM', icon: '🌅', category: 'nutrition' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState({ water: '', calories: '', fitness: '' });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { profile, updateProfile, updateGoals, getTodayPoints } = useWellnessData();

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
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto relative">
      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0 w-full" />
      
      {/* Sticky Header */}
      <header className={`pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8 bg-background transition-all duration-300 ${
        isHeaderSticky 
          ? 'sticky top-0 z-50 shadow-md border-b border-border/50 backdrop-blur-sm bg-background/95' 
          : ''
      }`}>
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
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
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

      {/* Achievements */}
      <div className="px-4 sm:px-5 md:px-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = profile.achievements?.includes(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-colors ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20'
                    : 'bg-muted/50 opacity-50'
                }`}
              >
                <span className="text-xl sm:text-3xl">{achievement.icon}</span>
                <p className="text-[10px] sm:text-xs font-medium mt-1 sm:mt-2 line-clamp-1">{achievement.name}</p>
              </motion.div>
            );
          })}
        </div>
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
