import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Droplets, Utensils, Flame, ChevronRight } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementCategory } from '@/types/achievements';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categoryIcons: Record<AchievementCategory | 'all', React.ReactNode> = {
  all: <Trophy className="w-4 h-4" />,
  hydration: <Droplets className="w-4 h-4" />,
  nutrition: <Utensils className="w-4 h-4" />,
  streak: <Flame className="w-4 h-4" />,
};

const categoryLabels: Record<AchievementCategory | 'all', string> = {
  all: 'All',
  hydration: 'Hydration',
  nutrition: 'Nutrition',
  streak: 'Streaks',
};

export function AchievementsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const { 
    achievements, 
    isUnlocked, 
    getUnlockDate, 
    getAchievementProgress,
    newlyUnlocked,
    unlockedAchievements,
  } = useAchievements();

  const filteredAchievements = activeCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeCategory);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </motion.div>
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
          <span className="text-base sm:text-lg font-semibold">Achievements</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount} unlocked
        </span>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              {/* Category Tabs */}
              <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as AchievementCategory | 'all')}>
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 gap-1">
                  {(Object.keys(categoryLabels) as (AchievementCategory | 'all')[]).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {categoryIcons[category]}
                      <span className="hidden sm:inline">{categoryLabels[category]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value={activeCategory} className="mt-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
                  >
                    {filteredAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
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
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
