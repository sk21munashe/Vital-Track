import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Loader2, 
  Clock, 
  Flame,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MealAlternative {
  name: string;
  description: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  prepTime: string;
  tags: string[];
  whyGood: string;
}

interface MealSwapButtonProps {
  dayIndex: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  currentMeal: string;
}

export function MealSwapButton({ dayIndex, mealType, currentMeal }: MealSwapButtonProps) {
  const { healthPlan, healthProfile, updateMeal } = useUserPlan();
  const [isOpen, setIsOpen] = useState(false);
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [swapReason, setSwapReason] = useState('');

  const fetchAlternatives = async () => {
    if (!healthPlan || !healthProfile) return;
    
    setIsLoading(true);
    setAlternatives([]);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-meal-swap`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            currentMeal,
            mealType,
            dietPreference: healthProfile.dietPreference,
            healthGoal: healthProfile.healthGoal,
            dailyCalories: healthPlan.dailyCalories,
            macros: healthPlan.macros,
            reason: swapReason || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get alternatives');
      }

      const data = await response.json();
      setAlternatives(data.alternatives || []);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get alternatives');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchAlternatives();
    }
  };

  const handleSelectAlternative = async (alternative: MealAlternative) => {
    try {
      await updateMeal(dayIndex, mealType, alternative.description);
      toast.success(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} swapped!`);
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to update meal');
    }
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks'
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCw className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Swap {mealTypeLabels[mealType]}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 border-b bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Current meal:</p>
            <p className="text-sm font-medium">{currentMeal}</p>
            
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Optional: Why swap? (e.g., want something quicker)"
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="text-sm h-9"
              />
              <Button 
                size="sm" 
                onClick={fetchAlternatives}
                disabled={isLoading}
                className="h-9"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 max-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Finding alternatives...</p>
              </div>
            ) : alternatives.length > 0 ? (
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {alternatives.map((alt, index) => (
                    <motion.div
                      key={alt.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-4 hover:bg-muted/50 transition-colors cursor-pointer group/card"
                      onClick={() => handleSelectAlternative(alt)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{alt.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{alt.description}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover/card:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="w-3 h-3" />
                          <span>{alt.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{alt.prepTime}</span>
                        </div>
                      </div>
                      
                      {/* Macros */}
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-blue-500">P: {alt.macros.protein}g</span>
                        <span className="text-emerald-500">C: {alt.macros.carbs}g</span>
                        <span className="text-amber-500">F: {alt.macros.fats}g</span>
                      </div>
                      
                      {/* Tags */}
                      {alt.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alt.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Why good */}
                      <p className="text-xs text-primary/80 mt-2 italic">
                        ✨ {alt.whyGood}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground text-center">
                  No alternatives yet.<br />Click refresh to get suggestions.
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
