import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WaterBottleProps {
  current: number;
  goal: number;
  className?: string;
}

export function WaterBottle({ current, goal, className }: WaterBottleProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 100 160" className="w-full h-full">
        <defs>
          <linearGradient id="waterFill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(200 85% 45%)" />
            <stop offset="50%" stopColor="hsl(200 85% 55%)" />
            <stop offset="100%" stopColor="hsl(200 85% 65%)" />
          </linearGradient>
          <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220 15% 92%)" />
            <stop offset="50%" stopColor="hsl(220 15% 96%)" />
            <stop offset="100%" stopColor="hsl(220 15% 90%)" />
          </linearGradient>
          <clipPath id="bottleClip">
            <path d="M30 30 L30 20 Q30 10 40 10 L60 10 Q70 10 70 20 L70 30 Q80 35 80 50 L80 140 Q80 150 70 150 L30 150 Q20 150 20 140 L20 50 Q20 35 30 30 Z" />
          </clipPath>
          <filter id="waterGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Bottle outline */}
        <path 
          d="M30 30 L30 20 Q30 10 40 10 L60 10 Q70 10 70 20 L70 30 Q80 35 80 50 L80 140 Q80 150 70 150 L30 150 Q20 150 20 140 L20 50 Q20 35 30 30 Z"
          fill="url(#bottleGradient)"
          stroke="hsl(220 15% 85%)"
          strokeWidth="2"
        />
        
        {/* Water fill with animation */}
        <g clipPath="url(#bottleClip)">
          <motion.rect
            x="20"
            y="150"
            width="60"
            height="140"
            fill="url(#waterFill)"
            filter="url(#waterGlow)"
            initial={{ y: 150 }}
            animate={{ y: 150 - (percentage * 1.4) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          
          {/* Wave effect */}
          <motion.path
            d="M 0 0 Q 15 -10 30 0 Q 45 10 60 0 Q 75 -10 90 0 Q 105 10 120 0 L 120 20 L 0 20 Z"
            fill="hsl(200 85% 60% / 0.5)"
            initial={{ x: 10, y: 150 - (percentage * 1.4) }}
            animate={{ 
              x: [10, -20, 10],
              y: 150 - (percentage * 1.4) - 5
            }}
            transition={{ 
              x: { duration: 3, repeat: Infinity, ease: 'linear' },
              y: { duration: 0.8, ease: 'easeOut' }
            }}
          />
        </g>
        
        {/* Cap */}
        <rect x="35" y="5" width="30" height="8" rx="2" fill="hsl(200 85% 45%)" />
        
        {/* Bottle shine */}
        <path 
          d="M25 50 Q25 40 35 35 L35 140 Q25 140 25 130 Z"
          fill="hsl(0 0% 100% / 0.3)"
        />
      </svg>
      
      {/* Percentage label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-3xl font-bold text-gradient-water">{Math.round(percentage)}%</span>
          <p className="text-xs text-muted-foreground mt-1">{current}ml / {goal}ml</p>
        </motion.div>
      </div>
    </div>
  );
}
