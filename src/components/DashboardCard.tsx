import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function DashboardCard({ children, className, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        'bg-card rounded-3xl p-6 shadow-md border border-border/50',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
