import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementBadge } from '@/components/AchievementBadge';
import { DashboardCard } from '@/components/DashboardCard';

export function AchievementsSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    achievements, 
    isUnlocked, 
    getUnlockDate, 
    getAchievementProgress,
    newlyUnlocked,
    unlockedAchievements,
  } = useAchievements();

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  // Sort: unlocked first, then by tier (gold > silver > bronze)
  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = isUnlocked(a.id);
    const bUnlocked = isUnlocked(b.id);
    if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  return (
    <DashboardCard className="overflow-hidden">
      {/* Header - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-sm">Achievements</h2>
            <p className="text-xs text-muted-foreground">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mini progress */}
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
            />
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-4 pt-2 border-t border-border/50">
              {/* Badge grid */}
              <div className="grid grid-cols-4 gap-0">
                {sortedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      isUnlocked={isUnlocked(achievement.id)}
                      unlockedAt={getUnlockDate(achievement.id)}
                      progress={getAchievementProgress(achievement)}
                      isNewlyUnlocked={newlyUnlocked === achievement.id}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardCard>
  );
}
