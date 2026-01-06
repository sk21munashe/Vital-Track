import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyData } from './types';

interface TodaysFocusProps {
  data: JourneyData;
}

export function TodaysFocus({ data }: TodaysFocusProps) {
  const [completed, setCompleted] = useState(false);

  // Generate a smart challenge based on current progress
  const challenge = useMemo(() => {
    const waterRemaining = data.water.goal - data.water.current;
    const caloriesRemaining = data.calories.goal - data.calories.current;
    
    if (waterRemaining > 500 && data.water.progress < data.calories.progress) {
      return {
        text: `Drink ${Math.min(waterRemaining, 750).toLocaleString()}ml more water to boost your hydration`,
        type: 'water' as const,
        icon: '💧'
      };
    } else if (caloriesRemaining > 0 && data.calories.progress < 50) {
      return {
        text: `Log your next meal to track your nutrition goals`,
        type: 'calories' as const,
        icon: '🍽️'
      };
    } else if (waterRemaining > 0 && waterRemaining <= 500) {
      return {
        text: `Just ${waterRemaining.toLocaleString()}ml more to hit your water goal!`,
        type: 'water' as const,
        icon: '🎯'
      };
    } else if (data.water.progress >= 100 && data.calories.progress >= 100) {
      return {
        text: `Amazing! You've completed all your goals today!`,
        type: 'success' as const,
        icon: '🏆'
      };
    } else {
      return {
        text: `Stay consistent - keep logging your water and meals`,
        type: 'general' as const,
        icon: '⭐'
      };
    }
  }, [data]);

  // Generate AI insight based on patterns
  const aiInsight = useMemo(() => {
    const currentHour = new Date().getHours();
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    if (currentHour < 12 && data.water.progress < 30) {
      return "Starting your morning with water helps boost metabolism. Aim for 500ml before noon.";
    } else if (currentHour >= 14 && currentHour < 17 && data.water.progress < 60) {
      return `Afternoon hydration dip detected. Try setting a 3 PM reminder to stay on track.`;
    } else if (data.water.progress >= 80 && data.calories.progress < 50) {
      return "Great water intake! Don't forget to log your meals to balance your nutrition.";
    } else if (dayOfWeek === 'Monday' || dayOfWeek === 'Tuesday') {
      return `${dayOfWeek}s can be challenging - you've got this! Small consistent steps lead to big results.`;
    } else {
      return "Consistency is key. Your daily habits are building a healthier you.";
    }
  }, [data.water.progress, data.calories.progress]);

  return (
    <motion.div 
      className="bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground tracking-wide">TODAY'S FOCUS</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Challenge */}
        <motion.div 
          className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
            completed 
              ? 'bg-accent/20 border border-accent/30' 
              : 'bg-muted/30 border border-border/30'
          }`}
          animate={completed ? { scale: [1, 1.02, 1] } : {}}
        >
          <motion.span 
            className="text-3xl"
            animate={completed ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {completed ? '✅' : challenge.icon}
          </motion.span>
          <div className="flex-1">
            <p className={`text-sm font-medium ${completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {challenge.text}
            </p>
          </div>
        </motion.div>

        {/* AI Insight */}
        <div className="flex items-start gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">AI Insight</span>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {aiInsight}
            </p>
          </div>
        </div>

        {/* Mark Complete Button */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={() => setCompleted(!completed)}
            variant={completed ? "secondary" : "default"}
            className={`w-full py-5 text-sm font-semibold transition-all ${
              completed 
                ? 'bg-accent/20 text-accent-foreground hover:bg-accent/30' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {completed ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Completed!
              </>
            ) : (
              'Mark Complete'
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
