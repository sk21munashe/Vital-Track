import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Flame,
  Droplets,
  Dumbbell,
  Lightbulb,
  Calendar,
  User,
  Target,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HealthProfile, HealthPlan } from '@/types/healthCoach';
import { GroceryList } from '@/components/GroceryList';
import { MealSwapButton } from '@/components/MealSwapButton';
import { cn } from '@/lib/utils';

interface MealPlanReportProps {
  profile: HealthProfile;
  plan: HealthPlan;
  onStartPlan: () => void;
}

const GOAL_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  weight_loss: { label: 'Weight Loss', emoji: '🔥', color: 'from-orange-500 to-red-500' },
  weight_gain: { label: 'Weight Gain', emoji: '📈', color: 'from-green-500 to-emerald-500' },
  muscle_building: { label: 'Muscle Building', emoji: '💪', color: 'from-blue-500 to-indigo-500' },
  maintenance: { label: 'Maintenance', emoji: '⚖️', color: 'from-purple-500 to-pink-500' },
};

const DIET_LABELS: Record<string, string> = {
  standard: 'Balanced',
  high_protein: 'High Protein',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  keto: 'Keto',
  paleo: 'Paleo',
  mediterranean: 'Mediterranean',
};

const DAY_COLORS = [
  'from-primary/20 to-primary/5',
  'from-accent/20 to-accent/5',
  'from-emerald-500/20 to-emerald-500/5',
  'from-orange-500/20 to-orange-500/5',
  'from-blue-500/20 to-blue-500/5',
  'from-purple-500/20 to-purple-500/5',
  'from-pink-500/20 to-pink-500/5',
];

export function MealPlanReport({ profile, plan, onStartPlan }: MealPlanReportProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  
  const goalInfo = GOAL_LABELS[profile.healthGoal] || GOAL_LABELS.maintenance;
  const dietLabel = DIET_LABELS[profile.dietPreference] || 'Balanced';
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Animated Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 pt-6 pb-4 px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3",
            "bg-gradient-to-br", goalInfo.color
          )}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold"
        >
          Your Personalized Plan
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm mt-1"
        >
          AI-crafted just for you
        </motion.p>
      </motion.header>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md mx-auto pb-32 space-y-5"
        >
          {/* Personal Summary Card */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-card to-muted/50 rounded-2xl p-4 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Your Profile Summary</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goalInfo.emoji}</span>
                <div>
                  <p className="text-muted-foreground text-xs">Goal</p>
                  <p className="font-medium">{goalInfo.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🍽️</span>
                <div>
                  <p className="text-muted-foreground text-xs">Diet</p>
                  <p className="font-medium">{dietLabel}</p>
                </div>
              </div>
            </div>
            
            {/* Calorie & Macro Summary */}
            <div className="mt-4 p-3 bg-background/60 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Daily Target</span>
                </div>
                <span className="text-xl font-bold text-primary">{plan.dailyCalories.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
              
              {/* Macro Bar */}
              <div className="h-3 rounded-full overflow-hidden flex bg-muted/50 mt-2">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(plan.macros.protein * 4 / plan.dailyCalories) * 100}%` }}
                />
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${(plan.macros.carbs * 4 / plan.dailyCalories) * 100}%` }}
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${(plan.macros.fats * 9 / plan.dailyCalories) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Protein {plan.macros.protein}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Carbs {plan.macros.carbs}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Fats {plan.macros.fats}g</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Overview */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">7-Day Meal Plan</h2>
            </div>
            
            <div className="space-y-2">
              {plan.weeklyPlan.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="overflow-hidden rounded-xl border border-border/50"
                >
                  {/* Day Header */}
                  <button
                    onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                    className={cn(
                      "w-full p-3 flex items-center justify-between transition-colors",
                      "bg-gradient-to-r", DAY_COLORS[index % DAY_COLORS.length]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{index + 1}</span>
                      <span className="font-medium text-sm">{day.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Droplets className="w-3 h-3" />
                        <span>{day.waterGoal}L</span>
                      </div>
                      {expandedDay === index ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {/* Expanded Content */}
                  {expandedDay === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-3 bg-card/50 space-y-3"
                    >
                      {/* Meals */}
                      <div className="space-y-2">
                        {([
                          { label: 'Breakfast', emoji: '🌅', value: day.meals.breakfast, type: 'breakfast' as const },
                          { label: 'Lunch', emoji: '☀️', value: day.meals.lunch, type: 'lunch' as const },
                          { label: 'Dinner', emoji: '🌙', value: day.meals.dinner, type: 'dinner' as const },
                          { label: 'Snacks', emoji: '🍎', value: day.meals.snacks, type: 'snacks' as const },
                        ]).map((meal) => (
                          <div key={meal.label} className="flex gap-2 text-sm group">
                            <span className="text-base">{meal.emoji}</span>
                            <div className="flex-1">
                              <p className="font-medium text-xs text-muted-foreground">{meal.label}</p>
                              <p className="text-foreground">{meal.value}</p>
                            </div>
                            <MealSwapButton
                              dayIndex={index}
                              mealType={meal.type}
                              currentMeal={meal.value}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Exercise */}
                      <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                        <Dumbbell className="w-4 h-4 text-primary mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-xs text-muted-foreground">Exercise</p>
                          <p>{day.exerciseSuggestion}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Nutrition Tips */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-4 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Personalized Tips</h2>
            </div>
            
            <ul className="space-y-2">
              {plan.recommendations.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Shopping List - Now AI Powered */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-2xl p-4 border border-emerald-500/20"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                🛒 Weekly Grocery List
              </h2>
              <GroceryList />
            </div>
            <p className="text-xs text-muted-foreground">
              Generate a detailed shopping list with quantities based on your meal plan.
            </p>
          </motion.div>

          {/* Stats Footer */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">BMR</p>
              <p className="font-bold">{plan.bmr.toLocaleString()} kcal</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-center">
              <Target className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">TDEE</p>
              <p className="font-bold">{plan.tdee.toLocaleString()} kcal</p>
            </div>
          </motion.div>
        </motion.div>
      </ScrollArea>

      {/* Fixed Bottom CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t"
      >
        <div className="max-w-md mx-auto">
          <Button
            onClick={onStartPlan}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Plan
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            You can always access this plan from your dashboard
          </p>
        </div>
      </motion.div>
    </div>
  );
}
