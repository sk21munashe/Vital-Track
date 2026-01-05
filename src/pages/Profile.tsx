import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Star, Flame, Edit2, Settings, Target, Droplets, Utensils, Sparkles, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState({ water: '', calories: '' });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
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

    updateGoals({ waterGoal: water, calorieGoal: calories });
    setShowEditGoals(false);
    toast.success('Goals updated!');
  };

  const handleAISuggestGoals = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-health-plan', {
        body: {
          prompt: `Suggest daily health goals for a person. Return ONLY a JSON object with these exact fields:
          {
            "waterGoal": <number in ml, typically 2000-3500>,
            "calorieGoal": <number, typically 1500-2500>,
            "reasoning": "<brief explanation>"
          }
          Consider general healthy adult recommendations.`
        }
      });

      if (error) throw error;

      // Try to parse the response
      let suggestions;
      if (typeof data === 'string') {
        // Try to extract JSON from the response
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        }
      } else if (data?.response) {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        }
      } else {
        suggestions = data;
      }

      if (suggestions?.waterGoal && suggestions?.calorieGoal) {
        setEditGoals({
          water: suggestions.waterGoal.toString(),
          calories: suggestions.calorieGoal.toString()
        });
        toast.success('AI suggestions loaded!', {
          description: suggestions.reasoning || 'Personalized goals ready to save'
        });
      } else {
        // Fallback to sensible defaults
        setEditGoals({ water: '2500', calories: '2000' });
        toast.success('Suggested healthy defaults loaded!');
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      // Fallback to sensible defaults
      setEditGoals({ water: '2500', calories: '2000' });
      toast.info('Using recommended healthy defaults');
    } finally {
      setIsLoadingAI(false);
    }
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

      {/* Daily Goals Section */}
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-water/20 flex items-center justify-center">
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-nutrition/20 flex items-center justify-center">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-nutrition" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">Calories</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Daily calorie target</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-nutrition">{profile.goals.calorieGoal}</span>
          </DashboardCard>
        </div>
      </div>

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
            <DialogTitle>Set Daily Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* AI Suggest Button */}
            <Button
              variant="outline"
              onClick={handleAISuggestGoals}
              disabled={isLoadingAI}
              className="w-full border-primary/30 hover:bg-primary/10"
            >
              {isLoadingAI ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
              )}
              {isLoadingAI ? 'Getting AI Suggestions...' : 'Get AI Suggested Goals'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or set manually</span>
              </div>
            </div>

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
            <Button onClick={handleUpdateGoals} className="w-full">
              Save Goals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}