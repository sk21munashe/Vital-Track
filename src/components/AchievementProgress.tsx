import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'water' | 'nutrition' | 'fitness' | 'streak';
  requirement: number;
  current: number;
}

interface AchievementProgressProps {
  achievements: Achievement[];
  unlockedIds: string[];
}

export function AchievementProgress({ achievements, unlockedIds }: AchievementProgressProps) {
  return (
    <div className="space-y-3">
      {achievements.map((achievement, index) => {
        const isUnlocked = unlockedIds.includes(achievement.id);
        const progress = Math.min((achievement.current / achievement.requirement) * 100, 100);
        
        return (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'relative p-3 sm:p-4 rounded-xl border overflow-hidden',
              isUnlocked 
                ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30' 
                : 'bg-card border-border'
            )}
          >
            {/* Progress bar background */}
            <div className="absolute inset-0 bg-muted/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={cn(
                  'h-full',
                  isUnlocked 
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20'
                    : 'bg-primary/10'
                )}
              />
            </div>
            
            <div className="relative flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0',
                isUnlocked ? 'bg-amber-500/20' : 'bg-muted'
              )}>
                {achievement.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm sm:text-base truncate">{achievement.name}</h4>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{achievement.description}</p>
                
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 sm:w-24 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                        className={cn(
                          'h-full rounded-full',
                          isUnlocked 
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500' 
                            : 'bg-primary'
                        )}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {achievement.current}/{achievement.requirement}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs font-bold',
                    isUnlocked ? 'text-amber-500' : 'text-primary'
                  )}>
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
