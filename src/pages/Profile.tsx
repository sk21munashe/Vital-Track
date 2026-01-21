import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Star, Flame, Edit2, Settings, Target, Droplets, Utensils, Sparkles, Loader2, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardCard } from '@/components/DashboardCard';
import { MealPlanSection } from '@/components/MealPlanSection';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { AchievementsSection } from '@/components/AchievementsSection';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditGoals, setShowEditGoals] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoals, setEditGoals] = useState({ water: '', calories: '' });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { profile, updateProfile, updateGoals, getTodayPoints } = useWellnessData();
  const { updateAppStreak } = useAchievements();
  const { displayName, updateDisplayName } = useUserProfile();

  // Sync streak with achievements
  useEffect(() => {
    updateAppStreak(profile.streak);
  }, [profile.streak, updateAppStreak]);

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

  const handleUpdateProfile = async () => {
    if (editName.trim()) {
      try {
        // Optimistically update via context (handles DB sync)
        await updateDisplayName(editName.trim());
        // Also update local wellness profile
        updateProfile({ name: editName.trim() });
        setShowEditProfile(false);
        toast.success('Profile updated!');
      } catch (error) {
        toast.error('Failed to update profile');
      }
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
            <h1 className="text-xl sm:text-2xl font-bold">{t('profile.title')}</h1>
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
              <h2 className="text-lg sm:text-xl font-bold truncate">{displayName}</h2>
              <button
                onClick={() => {
                  setEditName(displayName);
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
                <span className="text-xs sm:text-sm font-medium">{profile.streak} {t('dashboard.dayStreak')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium">{profile.totalPoints} {t('common.pts')}</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* Today's Points */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3">{t('profile.todaysPoints')}</h2>
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-3xl sm:text-4xl font-bold"
          >
            {getTodayPoints()}
          </motion.div>
          <p className="text-xs sm:text-sm opacity-90 mt-1">{t('profile.pointsEarnedToday')}</p>
        </div>
      </div>

      {/* AI Meal Plan Section */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {t('profile.myMealPlan')}
        </h2>
        <MealPlanSection />
      </div>

      {/* Daily Goals Section */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t('profile.dailyGoals')}
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
            {t('common.edit')}
          </Button>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <DashboardCard className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-water/20 flex items-center justify-center">
                <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-water" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium">{t('profile.waterIntake')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.dailyHydrationGoal')}</p>
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
                <p className="text-sm sm:text-base font-medium">{t('profile.caloriesTarget')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.dailyCalorieTarget')}</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-bold text-nutrition">{profile.goals.calorieGoal}</span>
          </DashboardCard>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <AchievementsSection />
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t('profile.yourName')}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t('profile.yourName')}
              />
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">
              {t('profile.saveChanges')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goals Dialog */}
      <Dialog open={showEditGoals} onOpenChange={setShowEditGoals}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.setDailyGoals')}</DialogTitle>
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
              {isLoadingAI ? t('profile.gettingAISuggestions') : t('profile.getAISuggestedGoals')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t('profile.orSetManually')}</span>
              </div>
            </div>

            <div>
              <Label>{t('profile.dailyWaterGoal')}</Label>
              <Input
                type="number"
                value={editGoals.water}
                onChange={(e) => setEditGoals(prev => ({ ...prev, water: e.target.value }))}
                placeholder="e.g., 2000"
              />
            </div>
            <div>
              <Label>{t('profile.dailyCalorieGoal')}</Label>
              <Input
                type="number"
                value={editGoals.calories}
                onChange={(e) => setEditGoals(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="e.g., 2000"
              />
            </div>
            <Button onClick={handleUpdateGoals} className="w-full">
              {t('profile.saveGoals')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}