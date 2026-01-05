import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GoalCardProps {
  icon: LucideIcon;
  title: string;
  current: number;
  goal: number;
  unit: string;
  variant: 'water' | 'nutrition' | 'macros';
  onClick?: () => void;
}

const variantStyles = {
  water: {
    gradient: 'bg-gradient-water',
    fill: 'from-water/80 via-water/60 to-water/40',
    border: 'border-water/30 hover:border-water/50',
    shadow: 'shadow-water',
    bg: 'from-water/5 to-water/10',
    emoji: '💧',
  },
  nutrition: {
    gradient: 'bg-gradient-nutrition',
    fill: 'from-nutrition/80 via-nutrition/60 to-nutrition/40',
    border: 'border-nutrition/30 hover:border-nutrition/50',
    shadow: 'shadow-nutrition',
    bg: 'from-nutrition/5 to-nutrition/10',
    emoji: '🥗',
  },
  macros: {
    gradient: 'bg-gradient-fitness',
    fill: 'from-fitness/80 via-fitness/60 to-fitness/40',
    border: 'border-fitness/30 hover:border-fitness/50',
    shadow: 'shadow-fitness',
    bg: 'from-fitness/5 to-fitness/10',
    emoji: '⚡',
  },
};

const celebrationMessages = [
  "Amazing job! 🎉",
  "You did it! ⭐",
  "Goal crushed! 💪",
  "Fantastic! ✨",
  "Keep it up! 🌟",
];

export function GoalCard({ icon: Icon, title, current, goal, unit, variant, onClick }: GoalCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [celebrationMessage] = useState(
    celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)]
  );
  
  const progress = Math.min((current / goal) * 100, 100);
  const isComplete = progress >= 100;
  const styles = variantStyles[variant];
  
  // Auto-flip when completed for the first time
  useEffect(() => {
    if (isComplete && !hasCompletedOnce) {
      setHasCompletedOnce(true);
      setIsFlipped(true);
      // Auto-flip back after 3 seconds
      const timer = setTimeout(() => setIsFlipped(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasCompletedOnce]);
  
  const handleClick = () => {
    if (isComplete) {
      setIsFlipped(!isFlipped);
    } else {
      onClick?.();
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative h-32 sm:h-36 cursor-pointer perspective-1000"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-2xl border ${styles.border} overflow-hidden transition-all duration-300`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${styles.bg}`} />
          
          {/* Fill animation - rises from bottom */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${styles.fill} opacity-40`}
            initial={{ height: '0%' }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          
          {/* Shimmer effect on fill */}
          <motion.div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/20 to-transparent`}
            initial={{ height: '0%' }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 gap-2">
            {/* Icon with gradient background */}
            <motion.div 
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${styles.gradient} flex items-center justify-center ${styles.shadow}`}
              animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0, repeatDelay: 2 }}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </motion.div>
            
            {/* Title */}
            <p className="text-xs sm:text-sm font-semibold text-foreground">{title}</p>
            
            {/* Progress text */}
            <div className="text-center">
              <p className="text-sm sm:text-base font-bold text-foreground">
                {current.toLocaleString()} 
                <span className="text-muted-foreground font-normal text-xs sm:text-sm"> / {goal.toLocaleString()}{unit}</span>
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="w-full max-w-[80%] h-1.5 bg-muted/60 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${styles.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            
            {/* Completion indicator */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute top-2 right-2"
                >
                  <span className="text-lg">✅</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Back of card (celebration) */}
        <div
          className={`absolute inset-0 rounded-2xl border ${styles.border} overflow-hidden ${styles.gradient}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <motion.span
              className="text-4xl sm:text-5xl mb-2"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              🎉
            </motion.span>
            <p className="text-sm sm:text-base font-bold text-primary-foreground">
              Goal Complete!
            </p>
            <p className="text-xs sm:text-sm text-primary-foreground/90 mt-1">
              {celebrationMessage}
            </p>
            <p className="text-xs text-primary-foreground/70 mt-2">
              Tap to see progress
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}