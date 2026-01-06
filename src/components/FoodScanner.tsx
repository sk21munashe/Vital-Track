import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Loader2, AlertCircle, Check, Pencil, Trash2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FoodItem, FoodLog } from '@/types/wellness';

interface AnalyzedFood {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodAnalysisResult {
  foods: AnalyzedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

interface FoodScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFood: (mealType: FoodLog['mealType'], food: FoodItem) => void;
  selectedMealType: FoodLog['mealType'];
}

const nutritionTips = [
  "Did you know? Protein helps keep you full longer!",
  "Colorful plates = more nutrients!",
  "Hydration helps with digestion too!",
  "Eating slowly helps you feel satisfied sooner.",
  "Fiber from veggies supports gut health!",
  "Healthy fats are essential for brain function.",
];

export function FoodScanner({ open, onOpenChange, onAddFood, selectedMealType }: FoodScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [editableAnalysis, setEditableAnalysis] = useState<AnalyzedFood[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [randomTip, setRandomTip] = useState('');

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setScanState('idle');
      setAnalysisResult(null);
      setEditableAnalysis([]);
      setErrorMessage('');
    }
  }, [open]);

  // Set random tip when scanning starts
  useEffect(() => {
    if (scanState === 'scanning') {
      setRandomTip(nutritionTips[Math.floor(Math.random() * nutritionTips.length)]);
    }
  }, [scanState]);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Immediately show loading state
    setScanState('scanning');
    setErrorMessage('');

    try {
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: { imageBase64: base64 }
          });

          if (error) {
            console.error('Analysis error:', error);
            setScanState('error');
            setErrorMessage("Couldn't identify food. Try better lighting or enter manually.");
            return;
          }

          if (data.error) {
            setScanState('error');
            setErrorMessage(data.error);
            return;
          }

          setAnalysisResult(data);
          setEditableAnalysis(data.foods || []);
          setScanState('success');
        } catch (err) {
          console.error('Error calling analyze-food:', err);
          setScanState('error');
          setErrorMessage("Couldn't identify food. Try better lighting or enter manually.");
        }
      };

      reader.onerror = () => {
        setScanState('error');
        setErrorMessage("Failed to read image. Please try again.");
      };

      reader.readAsDataURL(file);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateEditableFood = (index: number, field: keyof AnalyzedFood, value: string | number) => {
    setEditableAnalysis(prev => prev.map((food, i) => 
      i === index ? { ...food, [field]: typeof food[field] === 'number' ? Number(value) : value } : food
    ));
  };

  const removeAnalyzedFood = (index: number) => {
    setEditableAnalysis(prev => prev.filter((_, i) => i !== index));
  };

  const addAnalyzedFoodsToMeal = () => {
    editableAnalysis.forEach(food => {
      const foodItem: FoodItem = {
        id: `ai-${Date.now()}-${Math.random()}`,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servingSize: food.portion,
      };
      onAddFood(selectedMealType, foodItem);
    });
    
    toast.success(`Added ${editableAnalysis.length} item(s) to ${selectedMealType}!`, {
      description: `+${editableAnalysis.length * 5} points earned`,
    });
    
    onOpenChange(false);
  };

  const handleRetry = () => {
    setScanState('idle');
    setErrorMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-nutrition" />
            AI Food Scanner
          </DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageCapture}
        />

        <AnimatePresence mode="wait">
          {/* Idle State - Camera Button */}
          {scanState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCameraClick}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-nutrition to-nutrition-dark flex items-center justify-center shadow-lg"
              >
                <Camera className="w-10 h-10 text-white" />
              </motion.button>
              <p className="text-sm text-muted-foreground text-center">
                Take a photo of your meal to instantly log nutrition info
              </p>
            </motion.div>
          )}

          {/* Scanning State - Loading Screen */}
          {scanState === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6 py-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-nutrition/20 border-t-nutrition"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-nutrition" />
                </div>
              </div>
              
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-semibold text-foreground mb-2"
                >
                  Scanning your food...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-muted-foreground"
                >
                  AI is analyzing your meal
                </motion.p>
              </div>

              {/* Fun nutrition tip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-4 py-3 rounded-xl bg-nutrition/10 border border-nutrition/20 max-w-xs"
              >
                <p className="text-xs text-center text-muted-foreground">
                  💡 {randomTip}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Error State */}
          {scanState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground mb-1">Oops! Something went wrong</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {errorMessage}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Enter Manually
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success State - Food Results */}
          {scanState === 'success' && analysisResult && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Confidence indicator */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {editableAnalysis.length} item{editableAnalysis.length !== 1 ? 's' : ''} detected
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  analysisResult.confidence === 'high' 
                    ? 'bg-green-500/10 text-green-600' 
                    : analysisResult.confidence === 'medium'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-red-500/10 text-red-600'
                }`}>
                  {analysisResult.confidence} confidence
                </span>
              </div>

              {/* Food items */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {editableAnalysis.map((food, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-xl bg-muted/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        value={food.name}
                        onChange={(e) => updateEditableFood(index, 'name', e.target.value)}
                        className="font-medium bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                      />
                      <button
                        onClick={() => removeAnalyzedFood(index)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <Input
                          type="number"
                          value={food.calories}
                          onChange={(e) => updateEditableFood(index, 'calories', e.target.value)}
                          className="text-center text-xs h-7 mb-1"
                        />
                        <span className="text-muted-foreground">cal</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          value={food.protein}
                          onChange={(e) => updateEditableFood(index, 'protein', e.target.value)}
                          className="text-center text-xs h-7 mb-1"
                        />
                        <span className="text-muted-foreground">protein</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          value={food.carbs}
                          onChange={(e) => updateEditableFood(index, 'carbs', e.target.value)}
                          className="text-center text-xs h-7 mb-1"
                        />
                        <span className="text-muted-foreground">carbs</span>
                      </div>
                      <div className="text-center">
                        <Input
                          type="number"
                          value={food.fat}
                          onChange={(e) => updateEditableFood(index, 'fat', e.target.value)}
                          className="text-center text-xs h-7 mb-1"
                        />
                        <span className="text-muted-foreground">fat</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Totals */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-nutrition/10 border border-nutrition/20">
                <span className="text-sm font-medium">Total</span>
                <div className="flex gap-3 text-sm">
                  <span className="font-semibold text-nutrition">
                    {editableAnalysis.reduce((sum, f) => sum + f.calories, 0)} cal
                  </span>
                  <span className="text-muted-foreground">
                    P: {editableAnalysis.reduce((sum, f) => sum + f.protein, 0)}g
                  </span>
                  <span className="text-muted-foreground">
                    C: {editableAnalysis.reduce((sum, f) => sum + f.carbs, 0)}g
                  </span>
                  <span className="text-muted-foreground">
                    F: {editableAnalysis.reduce((sum, f) => sum + f.fat, 0)}g
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Scan Again
                </Button>
                <Button 
                  onClick={addAnalyzedFoodsToMeal} 
                  className="flex-1 bg-nutrition hover:bg-nutrition-dark"
                  disabled={editableAnalysis.length === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add to Meal
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
