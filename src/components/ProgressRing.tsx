import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant: 'water' | 'nutrition' | 'fitness';
  label: string;
  value: string;
  subLabel?: string;
  className?: string;
}

const variantStyles = {
  water: {
    gradient: 'url(#waterGradient)',
    bgClass: 'text-water-light',
    textClass: 'text-gradient-water',
    glowClass: 'shadow-water',
  },
  nutrition: {
    gradient: 'url(#nutritionGradient)',
    bgClass: 'text-nutrition-light',
    textClass: 'text-gradient-nutrition',
    glowClass: 'shadow-nutrition',
  },
  fitness: {
    gradient: 'url(#fitnessGradient)',
    bgClass: 'text-fitness-light',
    textClass: 'text-gradient-fitness',
    glowClass: 'shadow-fitness',
  },
};

export function ProgressRing({
  progress,
  size = 140,
  strokeWidth = 12,
  variant,
  label,
  value,
  subLabel,
  className,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  const styles = variantStyles[variant];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className={cn('relative rounded-full', styles.glowClass)} style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(200 85% 55%)" />
              <stop offset="100%" stopColor="hsl(210 90% 60%)" />
            </linearGradient>
            <linearGradient id="nutritionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(145 65% 42%)" />
              <stop offset="100%" stopColor="hsl(160 70% 50%)" />
            </linearGradient>
            <linearGradient id="fitnessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(28 90% 55%)" />
              <stop offset="100%" stopColor="hsl(35 95% 60%)" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={styles.bgClass}
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={styles.gradient}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', styles.textClass)}>{value}</span>
          {subLabel && (
            <span className="text-xs text-muted-foreground mt-0.5">{subLabel}</span>
          )}
        </div>
      </div>
      
      <span className="mt-3 text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
