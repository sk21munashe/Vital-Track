import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r from-orange-500 to-amber-500',
        'text-white font-semibold shadow-lg',
        className
      )}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -10, 10, 0]
        }}
        transition={{ 
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 2
        }}
      >
        <Flame className="w-5 h-5" />
      </motion.div>
      <span>{streak} Day Streak!</span>
    </motion.div>
  );
}
