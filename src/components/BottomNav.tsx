import { NavLink } from '@/components/NavLink';
import { Home, Droplets, Utensils, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const { t } = useTranslation();
  
  const navItems = [
    { to: '/', icon: Home, labelKey: 'nav.home' },
    { to: '/water', icon: Droplets, labelKey: 'nav.water' },
    { to: '/calories', icon: Utensils, labelKey: 'nav.calories' },
    { to: '/profile', icon: User, labelKey: 'nav.profile' },
  ];

  return (
    <nav className="flex-shrink-0 w-full z-50 pb-safe">
      <div className="mx-auto max-w-lg">
        <div className="mx-3 mb-3 glass rounded-2xl p-2 shadow-lg">
          <div className="flex items-center justify-around">
            {navItems.map(({ to, icon: Icon, labelKey }) => (
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
                      {t(labelKey)}
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
