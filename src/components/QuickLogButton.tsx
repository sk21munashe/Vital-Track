import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuickLogButtonProps {
  icon: LucideIcon;
  label: string;
  variant: 'water' | 'nutrition' | 'fitness';
  onClick: () => void;
  className?: string;
}

const variantStyles = {
  water: {
    bg: 'bg-water-light hover:bg-water/20',
    icon: 'text-water',
    shadow: 'hover:shadow-water',
  },
  nutrition: {
    bg: 'bg-nutrition-light hover:bg-nutrition/20',
    icon: 'text-nutrition',
    shadow: 'hover:shadow-nutrition',
  },
  fitness: {
    bg: 'bg-fitness-light hover:bg-fitness/20',
    icon: 'text-fitness',
    shadow: 'hover:shadow-fitness',
  },
};

export function QuickLogButton({ icon: Icon, label, variant, onClick, className }: QuickLogButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl transition-all duration-200',
        styles.bg,
        styles.shadow,
        className
      )}
    >
      <div className={cn('p-2.5 rounded-xl bg-card', styles.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium text-foreground">{label}</span>
    </motion.button>
  );
}
