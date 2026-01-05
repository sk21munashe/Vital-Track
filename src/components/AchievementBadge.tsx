import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Utensils, Scale, Flame, Lock, Check, X } from 'lucide-react';
import { AchievementDefinition, AchievementTier } from '@/types/achievements';
import { format, parseISO } from 'date-fns';

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  isNewlyUnlocked?: boolean;
}

const tierStyles: Record<AchievementTier, { ring: string; bg: string; icon: string; label: string }> = {
  bronze: {
    ring: 'ring-amber-500/60',
    bg: 'bg-gradient-to-br from-amber-500 to-amber-700',
    icon: 'text-amber-100',
    label: 'text-amber-600',
  },
  silver: {
    ring: 'ring-slate-400/60',
    bg: 'bg-gradient-to-br from-slate-300 to-slate-500',
    icon: 'text-slate-100',
    label: 'text-slate-500',
  },
  gold: {
    ring: 'ring-yellow-400/60',
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    icon: 'text-yellow-100',
    label: 'text-yellow-600',
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Utensils,
  Scale,
  Flame,
};

export function AchievementBadge({
  achievement,
  isUnlocked,
  unlockedAt,
  progress,
  isNewlyUnlocked,
}: AchievementBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = tierStyles[achievement.tier];
  const IconComponent = iconMap[achievement.icon] || Flame;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowTooltip(!showTooltip)}
        initial={isNewlyUnlocked ? { scale: 0 } : { opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={isNewlyUnlocked 
          ? { type: 'spring', stiffness: 300, damping: 20 }
          : { duration: 0.2 }
        }
        className="flex flex-col items-center gap-2 p-3 w-full"
      >
        {/* Circular badge */}
        <div className="relative">
          {/* Progress ring (only for locked) */}
          {!isUnlocked && (
            <svg className="absolute inset-0 w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/30"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={(2 * Math.PI * 24) - (progress / 100) * (2 * Math.PI * 24)}
                strokeLinecap="round"
                className="text-primary/50 transition-all duration-500"
              />
            </svg>
          )}

          {/* Badge circle */}
          <motion.div
            animate={isNewlyUnlocked ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isUnlocked 
                ? `${style.bg} ring-2 ${style.ring} shadow-md` 
                : 'bg-muted/40 ring-1 ring-muted-foreground/20'
            }`}
          >
            {isUnlocked ? (
              <IconComponent className={`w-6 h-6 ${style.icon}`} />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground/50" />
            )}
          </motion.div>

          {/* Checkmark for unlocked */}
          {isUnlocked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </div>

        {/* Title */}
        <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 ${
          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {achievement.name}
        </span>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTooltip(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Tooltip content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-48 p-3 rounded-xl bg-popover border border-border shadow-lg"
            >
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-muted"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
              
              <div className="pr-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${style.label}`}>
                    {achievement.tier}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{achievement.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {achievement.description}
                </p>
                
                {isUnlocked && unlockedAt ? (
                  <p className="text-[10px] text-emerald-600 mt-2 font-medium">
                    ✓ Earned {format(parseISO(unlockedAt), 'MMM d, yyyy')}
                  </p>
                ) : (
                  <div className="mt-2">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                )}
              </div>
              
              {/* Arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 rotate-45 bg-popover border-r border-b border-border" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
