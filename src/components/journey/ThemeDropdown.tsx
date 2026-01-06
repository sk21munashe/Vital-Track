import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ArchitectureStyle } from './types';

interface ThemeDropdownProps {
  current: ArchitectureStyle;
  onChange: (theme: ArchitectureStyle) => void;
}

const themes: { id: ArchitectureStyle; label: string; icon: string }[] = [
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'space', label: 'Space', icon: '🚀' },
  { id: 'fun', label: 'Fun', icon: '🎮' },
  { id: 'minimalist', label: 'Minimal', icon: '◾' },
  { id: 'scientific', label: 'City', icon: '🏙️' },
];

export function ThemeDropdown({ current, onChange }: ThemeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themes.find(t => t.id === current) || themes[0];

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm">{currentTheme.icon}</span>
        <span className="text-xs font-medium text-primary">{currentTheme.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3 text-primary" />
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
              className="absolute right-0 top-full mt-2 z-50 bg-card rounded-xl shadow-lg border border-border overflow-hidden min-w-[140px]"
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
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                    current === theme.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <span className="text-sm">{theme.icon}</span>
                  <span className="text-xs font-medium">{theme.label}</span>
                  {current === theme.id && (
                    <span className="ml-auto text-primary text-xs">✓</span>
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