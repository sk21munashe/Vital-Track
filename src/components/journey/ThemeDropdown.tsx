import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Rocket, TreePine, Building2, Waves, Mountain } from 'lucide-react';
import { ArchitectureStyle } from './types';

interface ThemeDropdownProps {
  current: ArchitectureStyle;
  onChange: (style: ArchitectureStyle) => void;
}

const themes: { id: ArchitectureStyle; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'space', label: 'Space', icon: <Rocket className="w-4 h-4" />, color: 'text-purple-500' },
  { id: 'nature', label: 'Nature', icon: <TreePine className="w-4 h-4" />, color: 'text-emerald-500' },
  { id: 'city', label: 'City', icon: <Building2 className="w-4 h-4" />, color: 'text-amber-500' },
  { id: 'ocean', label: 'Ocean', icon: <Waves className="w-4 h-4" />, color: 'text-cyan-500' },
  { id: 'mountain', label: 'Mountain', icon: <Mountain className="w-4 h-4" />, color: 'text-slate-500' },
];

export function ThemeDropdown({ current, onChange }: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themes.find(t => t.id === current) || themes[0];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className={currentTheme.color}>{currentTheme.icon}</span>
        <span className="text-xs font-medium text-foreground">{currentTheme.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 top-full mt-2 z-50 min-w-40 bg-card rounded-xl border border-border shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => {
                    onChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    current === theme.id 
                      ? 'bg-primary/10' 
                      : 'hover:bg-muted/50'
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <span className={theme.color}>{theme.icon}</span>
                  <span className="text-sm font-medium text-foreground">{theme.label}</span>
                  {current === theme.id && (
                    <motion.div 
                      className="ml-auto w-2 h-2 rounded-full bg-primary"
                      layoutId="activeTheme"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
