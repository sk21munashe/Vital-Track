import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsBadgeProps {
  points: number;
  label?: string;
  className?: string;
}

export function PointsBadge({ points, label = 'Points Today', className }: PointsBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-gradient-to-r from-purple-500 to-indigo-500',
        'text-white shadow-lg',
        className
      )}
    >
      <Star className="w-4 h-4 fill-current" />
      <span className="font-bold">{points}</span>
      <span className="text-sm opacity-90">{label}</span>
    </motion.div>
  );
}
