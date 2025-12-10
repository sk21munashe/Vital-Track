import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Target, Trophy, Star, Flame, Droplets, Utensils, Dumbbell, Edit2 } from 'lucide-react';
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

  const { profile, updateProfile, updateGoals, getTodayPoints } = useWellnessData();

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
      <header className="pt-6 pb-4 px-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <DashboardCard className="mx-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <button
                onClick={() => {
                  setEditName(profile.name);
                  setShowEditProfile(true);
                }}
                className="p-1 rounded hover:bg-muted"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{profile.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">{profile.totalPoints} pts</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Stats Cards */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3">Today's Points</h2>
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold"
          >
            {getTodayPoints()}
          </motion.div>
          <p className="text-sm opacity-90 mt-1">points earned today</p>
        </div>
      </div>

      {/* Goals Section */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
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

        <div className="space-y-3">
          <DashboardCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-water-light flex items-center justify-center">
                <Droplets className="w-5 h-5 text-water" />
              </div>
              <div>
                <p className="font-medium">Water Intake</p>
                <p className="text-sm text-muted-foreground">Daily hydration goal</p>
              </div>
            </div>
            <span className="text-lg font-bold text-water">{profile.goals.waterGoal / 1000}L</span>
          </DashboardCard>

          <DashboardCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nutrition-light flex items-center justify-center">
                <Utensils className="w-5 h-5 text-nutrition" />
              </div>
              <div>
                <p className="font-medium">Calories</p>
                <p className="text-sm text-muted-foreground">Daily calorie target</p>
              </div>
            </div>
            <span className="text-lg font-bold text-nutrition">{profile.goals.calorieGoal}</span>
          </DashboardCard>

          <DashboardCard className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fitness-light flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-fitness" />
              </div>
              <div>
                <p className="font-medium">Fitness</p>
                <p className="text-sm text-muted-foreground">Weekly activity minutes</p>
              </div>
            </div>
            <span className="text-lg font-bold text-fitness">{profile.goals.fitnessGoal}m</span>
          </DashboardCard>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-5">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const isUnlocked = profile.achievements?.includes(achievement.id);
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-2xl text-center transition-colors ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20'
                    : 'bg-muted/50 opacity-50'
                }`}
              >
                <span className="text-3xl">{achievement.icon}</span>
                <p className="text-xs font-medium mt-2 line-clamp-1">{achievement.name}</p>
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
