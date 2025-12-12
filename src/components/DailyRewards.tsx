import { motion } from 'framer-motion';
import { Gift, Droplets, Utensils, Dumbbell, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyActivity {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
  count?: number;
  maxCount?: number;
}

interface DailyRewardsProps {
  waterLogs: number;
  mealLogs: number;
  fitnessLogs: number;
  habitsCompleted: number;
  allGoalsComplete: boolean;
}

export function DailyRewards({ 
  waterLogs, 
  mealLogs, 
  fitnessLogs, 
  habitsCompleted,
  allGoalsComplete 
}: DailyRewardsProps) {
  const activities: DailyActivity[] = [
    {
      id: 'water',
      name: 'Log Water',
      points: 10,
      icon: <Droplets className="w-4 h-4" />,
      color: 'text-water',
      completed: waterLogs > 0,
      count: waterLogs,
      maxCount: 8
    },
    {
      id: 'meals',
      name: 'Log Meals',
      points: 5,
      icon: <Utensils className="w-4 h-4" />,
      color: 'text-nutrition',
      completed: mealLogs >= 3,
      count: mealLogs,
      maxCount: 3
    },
    {
      id: 'fitness',
      name: 'Log Workout',
      points: 15,
      icon: <Dumbbell className="w-4 h-4" />,
      color: 'text-fitness',
      completed: fitnessLogs > 0,
      count: fitnessLogs,
      maxCount: 1
    },
    {
      id: 'habits',
      name: 'Complete Habits',
      points: 5,
      icon: <Target className="w-4 h-4" />,
      color: 'text-purple-500',
      completed: habitsCompleted > 0,
      count: habitsCompleted,
    },
    {
      id: 'bonus',
      name: 'All Goals Bonus',
      points: 50,
      icon: <Sparkles className="w-4 h-4" />,
      color: 'text-amber-500',
      completed: allGoalsComplete,
    },
  ];

  const totalEarned = activities.reduce((sum, a) => {
    if (a.id === 'water') return sum + (a.count || 0) * a.points;
    if (a.id === 'meals') return sum + Math.min(a.count || 0, 3) * a.points;
    if (a.id === 'fitness') return sum + (a.count || 0) * a.points;
    if (a.id === 'habits') return sum + (a.count || 0) * a.points;
    if (a.completed) return sum + a.points;
    return sum;
  }, 0);

  const maxPossible = 10 * 8 + 5 * 3 + 15 + 50 + 20; // water + meals + fitness + bonus + ~4 habits

  return (
    <div className="space-y-4">
      {/* Today's Earnings Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
              <motion.p
                key={totalEarned}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                +{totalEarned}
              </motion.p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Potential</p>
            <p className="text-sm font-medium">{maxPossible} max</p>
          </div>
        </div>
      </motion.div>

      {/* Activity List */}
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border transition-colors',
              activity.completed 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-card border-border'
            )}
          >
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center',
              activity.completed ? 'bg-primary/20' : 'bg-muted',
              activity.color
            )}>
              {activity.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{activity.name}</span>
                {activity.completed && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              {activity.count !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {activity.count}{activity.maxCount ? `/${activity.maxCount}` : ''} logged
                </p>
              )}
            </div>
            
            <div className={cn(
              'px-2 py-1 rounded-md text-xs font-bold',
              activity.completed 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted text-muted-foreground'
            )}>
              +{activity.points}/ea
            </div>
          </motion.div>
        ))}
      </div>

      {/* Points Guide */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 Earn points by logging activities daily. Complete all goals for a <span className="font-bold text-amber-500">50pt bonus!</span>
        </p>
      </div>
    </div>
  );
}
