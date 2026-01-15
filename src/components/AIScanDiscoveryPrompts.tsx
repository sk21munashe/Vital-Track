import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Sparkles, Apple, Coffee, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FirstTimeTooltipProps {
  show: boolean;
  onDismiss: () => void;
  onScanClick: () => void;
  children: React.ReactNode;
}

export function FirstTimeTooltip({ show, onDismiss, onScanClick, children }: FirstTimeTooltipProps) {
  if (!show) return <>{children}</>;
  
  return (
    <Tooltip open={show}>
      <TooltipTrigger asChild onClick={() => { onDismiss(); onScanClick(); }}>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side="left" 
        className="max-w-[250px] p-3 bg-primary text-primary-foreground border-primary"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-semibold text-sm">AI Food Scanner</span>
          </div>
          <p className="text-xs opacity-90">
            Tap here to scan your food with AI for automatic calorie counting!
          </p>
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-full mt-2 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
          >
            Got it
          </Button>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface ReengagementBannerProps {
  show: boolean;
  onScanClick: () => void;
  onDismiss: () => void;
}

export function ReengagementBanner({ show, onScanClick, onDismiss }: ReengagementBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-4 sm:mx-5 md:mx-8 mb-3"
        >
          <div className="flex items-center gap-2">
            <button 
              onClick={onScanClick}
              className="flex items-center gap-3 px-4 py-3 flex-1 rounded-xl bg-gradient-to-r from-nutrition/10 to-primary/10 border border-nutrition/20 hover:border-nutrition/40 transition-colors text-left"
            >
              <Camera className="w-4 h-4 text-nutrition shrink-0" />
              <p className="text-sm text-foreground">
                Try scanning your next meal for faster, automatic logging! 🍎
              </p>
            </button>
            <button 
              onClick={onDismiss}
              className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface EmptyStateCardProps {
  show: boolean;
  onScanClick: () => void;
}

export function EmptyStateCard({ show, onScanClick }: EmptyStateCardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-nutrition/20 via-primary/10 to-accent/10 border border-nutrition/30 p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-nutrition/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-nutrition/20 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-nutrition" />
                </div>
                <h3 className="font-semibold text-lg">Start with a Scan!</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Get precise calorie and macro counts instantly by scanning your food.
              </p>
              
              <Button 
                onClick={onScanClick}
                className="w-full bg-nutrition hover:bg-nutrition-dark gap-2"
              >
                <Camera className="w-4 h-4" />
                Try AI Scan
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MealTimeBannerProps {
  show: boolean;
  mealWindow: 'breakfast' | 'lunch' | 'dinner' | null;
  onScanClick: () => void;
  onDismiss: () => void;
}

export function MealTimeBanner({ show, mealWindow, onScanClick, onDismiss }: MealTimeBannerProps) {
  const getMealText = () => {
    switch (mealWindow) {
      case 'breakfast':
        return { text: 'Breakfast time?', icon: Coffee };
      case 'lunch':
        return { text: 'Lunch time?', icon: Apple };
      case 'dinner':
        return { text: 'Dinner time?', icon: Moon };
      default:
        return { text: 'Meal time?', icon: Apple };
    }
  };
  
  const { text, icon: Icon } = getMealText();
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 sm:mx-5 md:mx-8 mb-3"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-accent/50 border border-accent">
            <div className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-accent-foreground shrink-0" />
              <span className="text-foreground">{text} Scan your meal to log it in seconds.</span>
              <button 
                onClick={onScanClick}
                className="font-medium text-nutrition hover:text-nutrition-dark transition-colors whitespace-nowrap"
              >
                Scan Now
              </button>
            </div>
            <button 
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ManualEntryNudgeProps {
  onScanClick: () => void;
}

export function ManualEntryNudge({ onScanClick }: ManualEntryNudgeProps) {
  return (
    <p className="text-xs text-muted-foreground text-center mt-3">
      Prefer to scan?{' '}
      <button 
        onClick={onScanClick}
        className="text-nutrition hover:text-nutrition-dark underline underline-offset-2 transition-colors"
      >
        Use the AI camera for automatic detection
      </button>
    </p>
  );
}
