import { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Flame,
  Calendar,
  Eye,
  Utensils,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/DashboardCard';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { MealPlanReport } from '@/components/MealPlanReport';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { cn } from '@/lib/utils';

const GOAL_LABELS: Record<string, { label: string; emoji: string }> = {
  weight_loss: { label: 'Weight Loss', emoji: '🔥' },
  weight_gain: { label: 'Weight Gain', emoji: '📈' },
  muscle_building: { label: 'Muscle Building', emoji: '💪' },
  maintenance: { label: 'Maintenance', emoji: '⚖️' },
};

export function MealPlanSection() {
  const [showFullReport, setShowFullReport] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const { healthProfile, healthPlan, isLoading, refreshPlan } = useUserPlan();
  
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await refreshPlan();
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleOpen = () => {
    setShowFullReport(true);
  };
  
  
  // No plan available
  if (!healthPlan || !healthProfile) {
    return (
      <DashboardCard className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">No Meal Plan Yet</p>
          <p className="text-xs text-muted-foreground">Complete onboarding to get your personalized plan</p>
        </div>
      </DashboardCard>
    );
  }
  
  const goalInfo = GOAL_LABELS[healthProfile.healthGoal] || GOAL_LABELS.maintenance;
  const todayPlan = healthPlan.weeklyPlan[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <>
      <div className="space-y-3">
        {/* Plan Summary Card */}
        <DashboardCard className="overflow-hidden">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Your AI Meal Plan</h3>
                  <p className="text-xs text-muted-foreground">{goalInfo.emoji} {goalInfo.label}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullReport(true)}
                className="text-primary"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-sm font-bold">{healthPlan.dailyCalories}</p>
                <p className="text-[10px] text-muted-foreground">kcal/day</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Utensils className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{healthPlan.macros.protein}g</p>
                <p className="text-[10px] text-muted-foreground">Protein</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <Calendar className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-sm font-bold">7</p>
                <p className="text-[10px] text-muted-foreground">Days</p>
              </div>
            </div>
            
            {/* Today's Preview */}
            {todayPlan && (
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl p-3 border border-primary/10">
                <p className="text-xs font-medium text-muted-foreground mb-2">Today's Highlight</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🌅</span>
                    <span className="truncate">{todayPlan.meals.breakfast}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>☀️</span>
                    <span className="truncate">{todayPlan.meals.lunch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>🌙</span>
                    <span className="truncate">{todayPlan.meals.dinner}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Bar */}
          <div className="flex border-t border-border">
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-none border-r border-border text-xs gap-1.5"
              onClick={handleRegenerate}
              disabled={isRegenerating || isLoading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", (isRegenerating || isLoading) && "animate-spin")} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-none text-xs gap-1.5"
              onClick={handleOpen}
            >
              <Eye className="w-3.5 h-3.5" />
              Open
            </Button>
          </div>
        </DashboardCard>
      </div>
      
      {/* Full Report Dialog */}
      <Dialog open={showFullReport} onOpenChange={setShowFullReport}>
        <DialogContent className="max-w-md h-[90vh] p-0 gap-0 print:max-w-none print:h-auto print:fixed print:inset-0 print:z-[9999] print:bg-white">
          <MealPlanReport
            profile={healthProfile}
            plan={healthPlan}
            onStartPlan={() => setShowFullReport(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
