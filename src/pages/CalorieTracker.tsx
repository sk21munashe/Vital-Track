import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Utensils, Plus, Search, Calculator, Apple, Coffee, Moon, Cookie, Camera, ChevronDown, ChevronUp, Pencil, Trash2, Loader2, X, Target, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardCard } from '@/components/DashboardCard';
import { ProgressRing } from '@/components/ProgressRing';
import { useWellnessData } from '@/hooks/useWellnessData';
import { commonFoods } from '@/data/foodDatabase';
import { FoodItem, FoodLog } from '@/types/wellness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, time: 'Morning' },
  { id: 'lunch', label: 'Lunch', icon: Apple, time: 'Midday' },
  { id: 'dinner', label: 'Dinner', icon: Moon, time: 'Evening' },
  { id: 'snack', label: 'Snack', icon: Cookie, time: 'Anytime' },
] as const;

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

export default function CalorieTracker() {
  const navigate = useNavigate();
  const [showAddFood, setShowAddFood] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showMacroGoals, setShowMacroGoals] = useState(false);
  const [showFoodScanner, setShowFoodScanner] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<FoodLog['mealType']>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Expandable meal states
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  
  // Edit food state
  const [editingFood, setEditingFood] = useState<{ logId: string; food: FoodItem } | null>(null);
  
  // AI Scanner state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [editableAnalysis, setEditableAnalysis] = useState<AnalyzedFood[]>([]);

  // Calculator state
  const [calcData, setCalcData] = useState({
    age: '',
    gender: 'male' as 'male' | 'female',
    weight: '',
    height: '',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'maintain' as 'maintain' | 'lose' | 'gain',
  });
  const [calcResult, setCalcResult] = useState<number | null>(null);
  
  // Macro goals state
  const [macroGoals, setMacroGoals] = useState({ protein: '', carbs: '', fat: '' });

  // Sticky header observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const {
    profile,
    getTodayCalories,
    getTodayMeals,
    addFood,
    updateFood,
    deleteFood,
    updateGoals,
  } = useWellnessData();

  const todayCalories = getTodayCalories();
  const todayMeals = getTodayMeals();
  const caloriesRemaining = profile.goals.calorieGoal - todayCalories;
  
  // Calculate today's macros
  const todayMacros = todayMeals.reduce((acc, meal) => ({
    protein: acc.protein + (meal.foodItem.protein || 0),
    carbs: acc.carbs + (meal.foodItem.carbs || 0),
    fat: acc.fat + (meal.foodItem.fat || 0),
  }), { protein: 0, carbs: 0, fat: 0 });

  // Initialize macro goals from profile
  useEffect(() => {
    if (profile.goals.macros) {
      setMacroGoals({
        protein: profile.goals.macros.protein?.toString() || '',
        carbs: profile.goals.macros.carbs?.toString() || '',
        fat: profile.goals.macros.fat?.toString() || '',
      });
    }
  }, [profile.goals.macros]);

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: FoodItem) => {
    addFood(selectedMealType, food);
    toast.success(`Added ${food.name}! 🍽️`, {
      description: `+5 points earned`,
    });
    setShowAddFood(false);
    setSearchQuery('');
  };

  const handleAddCustomFood = () => {
    if (!customFood.name || !customFood.calories) return;

    const food: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFood.name,
      calories: parseInt(customFood.calories),
      protein: customFood.protein ? parseInt(customFood.protein) : undefined,
      carbs: customFood.carbs ? parseInt(customFood.carbs) : undefined,
      fat: customFood.fat ? parseInt(customFood.fat) : undefined,
    };

    handleAddFood(food);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const handleUpdateFood = () => {
    if (!editingFood) return;
    updateFood(editingFood.logId, editingFood.food);
    toast.success('Food updated!');
    setEditingFood(null);
  };

  const handleDeleteFood = (logId: string, foodName: string) => {
    deleteFood(logId);
    toast.success(`Removed ${foodName}`);
  };

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  // AI Food Scanner
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setShowFoodScanner(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setEditableAnalysis([]);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: { imageBase64: base64 }
          });

          if (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to analyze food. Please try again.');
            setShowFoodScanner(false);
            return;
          }

          if (data.error) {
            toast.error(data.error);
            setShowFoodScanner(false);
            return;
          }

          setAnalysisResult(data);
          setEditableAnalysis(data.foods || []);
        } catch (err) {
          console.error('Error calling analyze-food:', err);
          toast.error('Failed to analyze food. Please try again.');
          setShowFoodScanner(false);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsAnalyzing(false);
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
      addFood(selectedMealType, foodItem);
    });
    
    toast.success(`Added ${editableAnalysis.length} item(s) to ${selectedMealType}!`, {
      description: `+${editableAnalysis.length * 5} points earned`,
    });
    
    setShowFoodScanner(false);
    setAnalysisResult(null);
    setEditableAnalysis([]);
  };

  const calculateBMR = () => {
    const { age, gender, weight, height, activityLevel, goal } = calcData;
    if (!age || !weight || !height) return;

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let tdee = bmr * activityMultipliers[activityLevel];

    // Goal adjustment
    if (goal === 'lose') {
      tdee -= 500; // 0.5kg/week loss
    } else if (goal === 'gain') {
      tdee += 500; // 0.5kg/week gain
    }

    setCalcResult(Math.round(tdee));
  };

  const handleSetCalculatedGoal = () => {
    if (calcResult) {
      updateGoals({ calorieGoal: calcResult });
      setShowCalculator(false);
      toast.success('Calorie goal updated!');
    }
  };

  const handleSaveMacroGoals = () => {
    updateGoals({
      macros: {
        protein: macroGoals.protein ? parseInt(macroGoals.protein) : undefined,
        carbs: macroGoals.carbs ? parseInt(macroGoals.carbs) : undefined,
        fat: macroGoals.fat ? parseInt(macroGoals.fat) : undefined,
      }
    });
    setShowMacroGoals(false);
    toast.success('Macro goals updated!');
  };

  // Group today's meals by type
  const mealsByType = todayMeals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) acc[meal.mealType] = [];
    acc[meal.mealType].push(meal);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  return (
    <div className="h-full flex flex-col bg-background pb-4 overflow-y-auto relative">
      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
      />
      
      {/* Sentinel for sticky detection */}
      <div ref={sentinelRef} className="h-0 w-full" />
      
      {/* Sticky Header */}
      <header className={`pt-4 sm:pt-6 pb-3 sm:pb-4 px-4 sm:px-5 md:px-8 bg-background transition-all duration-300 ${
        isHeaderSticky 
          ? 'sticky top-0 z-50 shadow-md border-b border-border/50 backdrop-blur-sm bg-background/95' 
          : ''
      }`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gradient-nutrition truncate">Calorie Tracker</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Fuel your body right</p>
          </div>
          <button
            onClick={() => setShowMacroGoals(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
            title="Set Macro Goals"
          >
            <Target className="w-5 h-5 text-nutrition" />
          </button>
          <button
            onClick={() => setShowCalculator(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors flex-shrink-0"
          >
            <Calculator className="w-5 h-5 text-nutrition" />
          </button>
        </div>
      </header>

      {/* Summary Card */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6 glass-nutrition">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Calories Remaining</p>
            <p className={`text-2xl sm:text-3xl font-bold ${caloriesRemaining >= 0 ? 'text-nutrition' : 'text-destructive'}`}>
              {Math.abs(caloriesRemaining)}
              <span className="text-sm sm:text-lg font-normal text-muted-foreground ml-1">
                {caloriesRemaining < 0 ? 'over' : 'left'}
              </span>
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
              <span className="text-muted-foreground">
                Goal: <span className="text-foreground font-medium">{profile.goals.calorieGoal}</span>
              </span>
              <span className="text-muted-foreground">
                Consumed: <span className="text-foreground font-medium">{todayCalories}</span>
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <ProgressRing
              progress={(todayCalories / profile.goals.calorieGoal) * 100}
              variant="nutrition"
              label=""
              value={`${Math.round((todayCalories / profile.goals.calorieGoal) * 100)}%`}
              size={100}
            />
          </div>
        </div>
        
        {/* Macro Summary */}
        {(profile.goals.macros?.protein || profile.goals.macros?.carbs || profile.goals.macros?.fat) && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Today's Macros</p>
            <div className="grid grid-cols-3 gap-2">
              {profile.goals.macros?.protein && (
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                  <p className="text-xs text-muted-foreground">Protein</p>
                  <p className="font-semibold text-blue-500">{todayMacros.protein}g</p>
                  <p className="text-xs text-muted-foreground">/ {profile.goals.macros.protein}g</p>
                </div>
              )}
              {profile.goals.macros?.carbs && (
                <div className="text-center p-2 rounded-lg bg-amber-500/10">
                  <p className="text-xs text-muted-foreground">Carbs</p>
                  <p className="font-semibold text-amber-500">{todayMacros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">/ {profile.goals.macros.carbs}g</p>
                </div>
              )}
              {profile.goals.macros?.fat && (
                <div className="text-center p-2 rounded-lg bg-rose-500/10">
                  <p className="text-xs text-muted-foreground">Fat</p>
                  <p className="font-semibold text-rose-500">{todayMacros.fat}g</p>
                  <p className="text-xs text-muted-foreground">/ {profile.goals.macros.fat}g</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardCard>

      {/* Meal Type Buttons */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-nutrition" />
          Log a Meal
          <button
            onClick={handleCameraClick}
            className="ml-auto p-2 rounded-xl bg-nutrition/20 hover:bg-nutrition/30 transition-colors"
            title="Scan Food with AI"
          >
            <Camera className="w-5 h-5 text-nutrition" />
          </button>
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {mealTypes.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedMealType(id as FoodLog['mealType']);
                setShowAddFood(true);
              }}
              className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-nutrition-light hover:bg-nutrition/20 transition-colors flex flex-col items-center gap-1 sm:gap-2"
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-nutrition" />
              <span className="text-[10px] sm:text-xs font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Today's Meals */}
      <div className="px-4 sm:px-5 md:px-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3">Today's Meals</h2>
        {mealTypes.map(({ id, label, icon: Icon }) => {
          const meals = mealsByType[id] || [];
          const totalCalories = meals.reduce((sum, m) => sum + m.foodItem.calories, 0);
          const isExpanded = expandedMeals[id] ?? false;
          
          return (
            <Collapsible key={id} open={isExpanded} onOpenChange={() => toggleMealExpanded(id)}>
              <DashboardCard className="mb-3" delay={0.1}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-nutrition-light flex items-center justify-center">
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-nutrition" />
                      </div>
                      <span className="text-sm sm:text-base font-medium">{label}</span>
                      <span className="text-xs text-muted-foreground">({meals.length} items)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-nutrition">{totalCalories} cal</span>
                      {meals.length > 0 && (
                        isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <AnimatePresence>
                    {meals.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2 mt-3 pt-3 border-t border-border/50"
                      >
                        {meals.map((meal) => (
                          <motion.div 
                            key={meal.id} 
                            layout
                            className="flex items-center justify-between text-xs sm:text-sm py-2 px-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium truncate block">{meal.foodItem.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {meal.foodItem.calories} cal
                                {meal.foodItem.protein !== undefined && ` • P: ${meal.foodItem.protein}g`}
                                {meal.foodItem.carbs !== undefined && ` • C: ${meal.foodItem.carbs}g`}
                                {meal.foodItem.fat !== undefined && ` • F: ${meal.foodItem.fat}g`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFood({ logId: meal.id, food: { ...meal.foodItem } });
                                }}
                                className="p-1.5 rounded-lg hover:bg-nutrition/20 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5 text-nutrition" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFood(meal.id, meal.foodItem.name);
                                }}
                                className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedMealType(id as FoodLog['mealType']);
                            setShowAddFood(true);
                          }}
                          className="w-full py-2 text-xs text-nutrition hover:text-nutrition-dark transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add more
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CollapsibleContent>
                
                {meals.length === 0 && (
                  <button
                    onClick={() => {
                      setSelectedMealType(id as FoodLog['mealType']);
                      setShowAddFood(true);
                    }}
                    className="w-full py-2 mt-2 text-xs sm:text-sm text-muted-foreground hover:text-nutrition transition-colors"
                  >
                    + Add {label.toLowerCase()}
                  </button>
                )}
              </DashboardCard>
            </Collapsible>
          );
        })}
      </div>

      {/* Add Food Dialog */}
      <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-nutrition" />
              Add {mealTypes.find(m => m.id === selectedMealType)?.label}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="search" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
              <TabsTrigger value="scan" onClick={handleCameraClick}>
                <Camera className="w-4 h-4 mr-1" />
                Scan
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search" className="flex-1 overflow-hidden flex flex-col">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
                {filteredFoods.map((food) => (
                  <motion.button
                    key={food.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAddFood(food)}
                    className="w-full p-3 rounded-xl bg-muted/50 hover:bg-nutrition-light transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{food.name}</p>
                        <p className="text-xs text-muted-foreground">{food.servingSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-nutrition">{food.calories} cal</p>
                        {food.protein && (
                          <p className="text-xs text-muted-foreground">
                            P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-3">
              <div>
                <Label>Food Name</Label>
                <Input
                  placeholder="e.g., Homemade Salad"
                  value={customFood.name}
                  onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Calories *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 350"
                  value={customFood.calories}
                  onChange={(e) => setCustomFood(prev => ({ ...prev, calories: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={customFood.protein}
                    onChange={(e) => setCustomFood(prev => ({ ...prev, protein: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={customFood.carbs}
                    onChange={(e) => setCustomFood(prev => ({ ...prev, carbs: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood(prev => ({ ...prev, fat: e.target.value }))}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddCustomFood} 
                className="w-full bg-nutrition hover:bg-nutrition-dark"
                disabled={!customFood.name || !customFood.calories}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Food
              </Button>
            </TabsContent>
            
            <TabsContent value="scan" className="flex-1">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Camera className="w-12 h-12 text-nutrition mb-4" />
                <p className="text-muted-foreground mb-4">Take a photo of your food to get instant nutritional analysis</p>
                <Button onClick={handleCameraClick} className="bg-nutrition hover:bg-nutrition-dark">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Food Scanner Results Dialog */}
      <Dialog open={showFoodScanner} onOpenChange={setShowFoodScanner}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-nutrition" />
              Food Analysis
            </DialogTitle>
          </DialogHeader>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-nutrition animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing food...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          ) : editableAnalysis.length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              {analysisResult?.confidence && (
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  analysisResult.confidence === 'high' ? 'bg-green-500/20 text-green-600' :
                  analysisResult.confidence === 'medium' ? 'bg-amber-500/20 text-amber-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {analysisResult.confidence} confidence
                </div>
              )}
              
              <div className="space-y-3">
                {editableAnalysis.map((food, index) => (
                  <motion.div 
                    key={index}
                    layout
                    className="p-3 rounded-xl bg-muted/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        value={food.name}
                        onChange={(e) => updateEditableFood(index, 'name', e.target.value)}
                        className="font-medium bg-transparent border-none p-0 h-auto text-base"
                      />
                      <button
                        onClick={() => removeAnalyzedFood(index)}
                        className="p-1 rounded-lg hover:bg-destructive/20"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{food.portion}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Calories</Label>
                        <Input
                          type="number"
                          value={food.calories}
                          onChange={(e) => updateEditableFood(index, 'calories', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Protein</Label>
                        <Input
                          type="number"
                          value={food.protein}
                          onChange={(e) => updateEditableFood(index, 'protein', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Carbs</Label>
                        <Input
                          type="number"
                          value={food.carbs}
                          onChange={(e) => updateEditableFood(index, 'carbs', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fat</Label>
                        <Input
                          type="number"
                          value={food.fat}
                          onChange={(e) => updateEditableFood(index, 'fat', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {analysisResult?.notes && (
                <p className="text-xs text-muted-foreground italic">{analysisResult.notes}</p>
              )}
              
              <div className="p-3 rounded-xl bg-nutrition-light">
                <p className="text-sm font-medium mb-2">Total Nutrition</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-nutrition">
                      {editableAnalysis.reduce((sum, f) => sum + f.calories, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">cal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-500">
                      {editableAnalysis.reduce((sum, f) => sum + f.protein, 0)}g
                    </p>
                    <p className="text-xs text-muted-foreground">protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-500">
                      {editableAnalysis.reduce((sum, f) => sum + f.carbs, 0)}g
                    </p>
                    <p className="text-xs text-muted-foreground">carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-rose-500">
                      {editableAnalysis.reduce((sum, f) => sum + f.fat, 0)}g
                    </p>
                    <p className="text-xs text-muted-foreground">fat</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Label>Add to:</Label>
                <Select value={selectedMealType} onValueChange={(v) => setSelectedMealType(v as FoodLog['mealType'])}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={addAnalyzedFoodsToMeal}
                className="w-full bg-nutrition hover:bg-nutrition-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to {mealTypes.find(m => m.id === selectedMealType)?.label}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No food items detected. Try taking another photo.</p>
              <Button onClick={handleCameraClick} className="mt-4 bg-nutrition hover:bg-nutrition-dark">
                <Camera className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Food Dialog */}
      <Dialog open={!!editingFood} onOpenChange={() => setEditingFood(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-nutrition" />
              Edit Food
            </DialogTitle>
          </DialogHeader>
          
          {editingFood && (
            <div className="space-y-4">
              <div>
                <Label>Food Name</Label>
                <Input
                  value={editingFood.food.name}
                  onChange={(e) => setEditingFood(prev => prev ? { ...prev, food: { ...prev.food, name: e.target.value } } : null)}
                />
              </div>
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  value={editingFood.food.calories}
                  onChange={(e) => setEditingFood(prev => prev ? { ...prev, food: { ...prev.food, calories: parseInt(e.target.value) || 0 } } : null)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    value={editingFood.food.protein || ''}
                    onChange={(e) => setEditingFood(prev => prev ? { ...prev, food: { ...prev.food, protein: e.target.value ? parseInt(e.target.value) : undefined } } : null)}
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    value={editingFood.food.carbs || ''}
                    onChange={(e) => setEditingFood(prev => prev ? { ...prev, food: { ...prev.food, carbs: e.target.value ? parseInt(e.target.value) : undefined } } : null)}
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    value={editingFood.food.fat || ''}
                    onChange={(e) => setEditingFood(prev => prev ? { ...prev, food: { ...prev.food, fat: e.target.value ? parseInt(e.target.value) : undefined } } : null)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateFood}
                className="w-full bg-nutrition hover:bg-nutrition-dark"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Macro Goals Dialog */}
      <Dialog open={showMacroGoals} onOpenChange={setShowMacroGoals}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-nutrition" />
              Set Macro Goals
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Set your daily macro targets. Leave empty if you don't want to track a specific macro.</p>
            
            <div>
              <Label>Protein Goal (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 150"
                value={macroGoals.protein}
                onChange={(e) => setMacroGoals(prev => ({ ...prev, protein: e.target.value }))}
              />
            </div>
            <div>
              <Label>Carbs Goal (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 250"
                value={macroGoals.carbs}
                onChange={(e) => setMacroGoals(prev => ({ ...prev, carbs: e.target.value }))}
              />
            </div>
            <div>
              <Label>Fat Goal (g)</Label>
              <Input
                type="number"
                placeholder="e.g., 65"
                value={macroGoals.fat}
                onChange={(e) => setMacroGoals(prev => ({ ...prev, fat: e.target.value }))}
              />
            </div>
            
            <Button 
              onClick={handleSaveMacroGoals}
              className="w-full bg-nutrition hover:bg-nutrition-dark"
            >
              Save Macro Goals
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-nutrition" />
              Calorie Calculator
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Age</Label>
                <Input
                  type="number"
                  placeholder="25"
                  value={calcData.age}
                  onChange={(e) => setCalcData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={calcData.gender}
                  onValueChange={(value: 'male' | 'female') => setCalcData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="70"
                  value={calcData.weight}
                  onChange={(e) => setCalcData(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="175"
                  value={calcData.height}
                  onChange={(e) => setCalcData(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Activity Level</Label>
              <Select
                value={calcData.activityLevel}
                onValueChange={(value: typeof calcData.activityLevel) => setCalcData(prev => ({ ...prev, activityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (intense daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Goal</Label>
              <Select
                value={calcData.goal}
                onValueChange={(value: typeof calcData.goal) => setCalcData(prev => ({ ...prev, goal: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose 0.5kg/week</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Gain 0.5kg/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={calculateBMR} className="w-full">
              Calculate
            </Button>
            
            {calcResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-nutrition-light text-center"
              >
                <p className="text-sm text-muted-foreground">Your Daily Calorie Target</p>
                <p className="text-3xl font-bold text-nutrition">{calcResult}</p>
                <p className="text-xs text-muted-foreground mb-3">calories/day</p>
                <Button
                  onClick={handleSetCalculatedGoal}
                  size="sm"
                  className="bg-nutrition hover:bg-nutrition-dark"
                >
                  Set as My Goal
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
