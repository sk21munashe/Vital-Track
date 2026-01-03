import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Target,
  Lightbulb,
  Drumstick,
  Wheat,
  Droplets as Fat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/DashboardCard';
import { HealthPlan, HealthProfile } from '@/types/healthCoach';
import { cn } from '@/lib/utils';

interface AIPlanCardProps {
  plan: HealthPlan | null;
  profile: HealthProfile | null;
  isLoading: boolean;
  onGeneratePlan: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  weight_gain: 'Weight Gain',
  muscle_building: 'Muscle Building',
  maintenance: 'Maintenance',
};

export function AIPlanCard({ plan, profile, isLoading, onGeneratePlan }: AIPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!profile) {
    return null;
  }

  if (!plan) {
    return (
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Health Coach</h3>
            <p className="text-sm text-muted-foreground">Get your personalized plan</p>
          </div>
        </div>
        <Button 
          onClick={onGeneratePlan} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate My Plan
            </>
          )}
        </Button>
      </DashboardCard>
    );
  }

  const totalMacros = plan.macros.protein + plan.macros.carbs + plan.macros.fats;
  const proteinPercent = Math.round((plan.macros.protein / totalMacros) * 100);
  const carbsPercent = Math.round((plan.macros.carbs / totalMacros) * 100);
  const fatsPercent = Math.round((plan.macros.fats / totalMacros) * 100);

  return (
    <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Your AI Plan</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {GOAL_LABELS[profile.healthGoal]}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Compact View - Always visible */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 mb-3">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-primary">{plan.dailyCalories}</div>
          <div className="text-xs text-muted-foreground">Daily Cal</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <div className="text-lg font-semibold">{plan.macros.protein}g</div>
          <div className="text-xs text-muted-foreground">Protein</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <div className="text-lg font-semibold">{plan.macros.carbs}g</div>
          <div className="text-xs text-muted-foreground">Carbs</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <div className="text-lg font-semibold">{plan.macros.fats}g</div>
          <div className="text-xs text-muted-foreground">Fats</div>
        </div>
      </div>

      {/* Macro Bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-3">
        <div className="bg-red-500" style={{ width: `${proteinPercent}%` }} />
        <div className="bg-amber-500" style={{ width: `${carbsPercent}%` }} />
        <div className="bg-blue-500" style={{ width: `${fatsPercent}%` }} />
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 pt-3 border-t"
        >
          {/* Detailed Macros */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-xl bg-red-500/10">
              <Drumstick className="w-4 h-4 mx-auto mb-1 text-red-500" />
              <div className="font-bold">{plan.macros.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-amber-500/10">
              <Wheat className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div className="font-bold">{plan.macros.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-blue-500/10">
              <Fat className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="font-bold">{plan.macros.fats}g</div>
              <div className="text-xs text-muted-foreground">Fats</div>
            </div>
          </div>

          {/* AI Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Tips
            </div>
            {plan.recommendations.slice(0, 3).map((tip, index) => (
              <div
                key={index}
                className="flex gap-2 p-2 rounded-lg bg-muted/50 text-sm"
              >
                <span className="text-primary font-bold">{index + 1}.</span>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>

          {/* Generate New Plan */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGeneratePlan} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh Plan'}
          </Button>
        </motion.div>
      )}
    </DashboardCard>
  );
}
