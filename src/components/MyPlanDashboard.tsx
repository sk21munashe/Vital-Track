import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Drumstick, 
  Wheat, 
  Droplets as Fat,
  Lightbulb,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Dumbbell,
  Droplets,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/DashboardCard';
import { HealthPlan, HealthProfile } from '@/types/healthCoach';
import { cn } from '@/lib/utils';

interface MyPlanDashboardProps {
  plan: HealthPlan;
  profile: HealthProfile;
  onReset: () => void;
}

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss',
  weight_gain: 'Weight Gain',
  muscle_building: 'Muscle Building',
  maintenance: 'Maintenance',
};

const DIET_LABELS: Record<string, string> = {
  standard: 'Standard',
  high_protein: 'High Protein',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  keto: 'Keto',
  paleo: 'Paleo',
  mediterranean: 'Mediterranean',
};

export function MyPlanDashboard({ plan, profile, onReset }: MyPlanDashboardProps) {
  const [selectedDay, setSelectedDay] = useState(0);

  const totalMacros = plan.macros.protein + plan.macros.carbs + plan.macros.fats;
  const proteinPercent = Math.round((plan.macros.protein / totalMacros) * 100);
  const carbsPercent = Math.round((plan.macros.carbs / totalMacros) * 100);
  const fatsPercent = Math.round((plan.macros.fats / totalMacros) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-6 pb-4 px-4 sm:px-6 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">My Plan</h1>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="w-4 h-4 mr-1" />
            New Plan
          </Button>
        </div>

        {/* Profile Summary */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            {GOAL_LABELS[profile.healthGoal] || profile.healthGoal}
          </span>
          <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
            {DIET_LABELS[profile.dietPreference] || profile.dietPreference}
          </span>
        </div>
      </header>

      <div className="px-4 sm:px-6 space-y-6 mt-4">
        {/* Calorie & Macro Overview */}
        <DashboardCard className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily Targets
          </h2>

          {/* Calories */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl sm:text-5xl font-bold text-primary"
            >
              {plan.dailyCalories.toLocaleString()}
            </motion.div>
            <p className="text-muted-foreground">calories per day</p>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-red-500/10">
              <Drumstick className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <div className="font-bold text-lg">{plan.macros.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
              <div className="text-xs font-medium text-red-500">{proteinPercent}%</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-500/10">
              <Wheat className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="font-bold text-lg">{plan.macros.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
              <div className="text-xs font-medium text-amber-500">{carbsPercent}%</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-blue-500/10">
              <Fat className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="font-bold text-lg">{plan.macros.fats}g</div>
              <div className="text-xs text-muted-foreground">Fats</div>
              <div className="text-xs font-medium text-blue-500">{fatsPercent}%</div>
            </div>
          </div>

          {/* Macro Bar */}
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="bg-red-500" style={{ width: `${proteinPercent}%` }} />
            <div className="bg-amber-500" style={{ width: `${carbsPercent}%` }} />
            <div className="bg-blue-500" style={{ width: `${fatsPercent}%` }} />
          </div>

          {/* BMR & TDEE */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">BMR</div>
              <div className="font-semibold">{plan.bmr.toLocaleString()} cal</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">TDEE</div>
              <div className="font-semibold">{plan.tdee.toLocaleString()} cal</div>
            </div>
          </div>
        </DashboardCard>

        {/* AI Recommendations */}
        <DashboardCard className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            AI Recommendations
          </h2>
          <div className="space-y-3">
            {plan.recommendations.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 p-3 rounded-xl bg-muted/50"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm">{tip}</p>
              </motion.div>
            ))}
          </div>
        </DashboardCard>

        {/* 7-Day Plan */}
        <DashboardCard className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            7-Day Meal Plan
          </h2>

          {/* Day Selector */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(prev => Math.max(0, prev - 1))}
              disabled={selectedDay === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              {plan.weeklyPlan.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={cn(
                    "px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                    selectedDay === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  Day {index + 1}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDay(prev => Math.min(plan.weeklyPlan.length - 1, prev + 1))}
              disabled={selectedDay === plan.weeklyPlan.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Day Details */}
          {plan.weeklyPlan[selectedDay] && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Meals */}
              <div className="space-y-3">
                {[
                  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
                  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
                  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
                  { key: 'snacks', label: 'Snacks', emoji: '🍎' },
                ].map((meal) => (
                  <div key={meal.key} className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{meal.emoji}</span>
                      <span className="font-medium text-sm">{meal.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.weeklyPlan[selectedDay].meals[meal.key as keyof typeof plan.weeklyPlan[0]['meals']]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Water & Exercise */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-water/10">
                  <Droplets className="w-5 h-5 text-water" />
                  <div>
                    <div className="text-xs text-muted-foreground">Water Goal</div>
                    <div className="font-semibold text-water">{plan.weeklyPlan[selectedDay].waterGoal}L</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-fitness/10">
                  <Dumbbell className="w-5 h-5 text-fitness" />
                  <div>
                    <div className="text-xs text-muted-foreground">Exercise</div>
                    <div className="font-semibold text-fitness text-xs">{plan.weeklyPlan[selectedDay].exerciseSuggestion}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
