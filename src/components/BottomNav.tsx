import { NavLink } from '@/components/NavLink';
import { Home, Droplets, Utensils, Dumbbell, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/water', icon: Droplets, label: 'Water' },
  { to: '/coach', icon: Sparkles, label: 'AI Coach' },
  { to: '/fitness', icon: Dumbbell, label: 'Fitness' },
  { to: '/calories', icon: Utensils, label: 'Calories' },
];

export function BottomNav() {
  return (
    <nav className="flex-shrink-0 w-full z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="mx-3 mb-3 glass rounded-2xl p-2 shadow-lg">
          <div className="flex items-center justify-around">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                activeClassName="text-primary bg-primary/10"
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                    </motion.div>
                    <span className={cn('text-xs font-medium', isActive && 'text-primary')}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
