import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Utensils, Plus, Search, Calculator, Apple, Coffee, Moon, Cookie, Camera, ChevronDown, ChevronUp, Pencil, Trash2, Target, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { DashboardCard } from '@/components/DashboardCard';
import { ProgressRing } from '@/components/ProgressRing';
import { useWellnessData } from '@/hooks/useWellnessData';
import { useAchievements } from '@/hooks/useAchievements';
import { useAIPlanSync } from '@/hooks/useAIPlanSync';
import { useAIScanDiscovery } from '@/hooks/useAIScanDiscovery';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FoodScanner } from '@/components/FoodScanner';
import { 
  FirstTimeTooltip,
  ReengagementBanner,
  EmptyStateCard,
  MealTimeBanner,
  ManualEntryNudge,
} from '@/components/AIScanDiscoveryPrompts';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, time: 'Morning' },
  { id: 'lunch', label: 'Lunch', icon: Apple, time: 'Midday' },
  { id: 'dinner', label: 'Dinner', icon: Moon, time: 'Evening' },
  { id: 'snack', label: 'Snack', icon: Cookie, time: 'Anytime' },
] as const;


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
  
  // Expandable meal states
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  
  // Edit food state
  const [editingFood, setEditingFood] = useState<{ logId: string; food: FoodItem } | null>(null);

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
  
  // AI Plan sync
  const { hasAIPlan, getAIPlanInfo } = useAIPlanSync();
  const aiPlanInfo = getAIPlanInfo();

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

  const { recordCalorieGoalMet } = useAchievements();

  const todayCalories = getTodayCalories();
  const todayMeals = getTodayMeals();
  const caloriesRemaining = profile.goals.calorieGoal - todayCalories;
  
  // AI Scan Discovery System
  const {
    showFirstTimeTooltip,
    showReengagementSuggestion,
    showEmptyStateCard,
    showMealTimeBanner,
    currentMealWindow,
    dismissFirstTimeTooltip,
    dismissReengagement,
    dismissMealTimeBanner,
    recordScanUsage,
    onFoodLogged,
  } = useAIScanDiscovery(todayMeals.length > 0);

  // Check if calorie goal is met (within 10% of target)
  useEffect(() => {
    const targetLow = profile.goals.calorieGoal * 0.9;
    const targetHigh = profile.goals.calorieGoal * 1.1;
    if (todayCalories >= targetLow && todayCalories <= targetHigh) {
      recordCalorieGoalMet();
    }
  }, [todayCalories, profile.goals.calorieGoal, recordCalorieGoalMet]);
  
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
    onFoodLogged(); // Dismiss empty state card
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

  // Open food scanner
  const handleOpenScanner = () => {
    recordScanUsage(); // Track scanner usage for discovery system
    setShowFoodScanner(true);
  };

  // Handle food added from scanner
  const handleScannerAddFood = (mealType: FoodLog['mealType'], food: FoodItem) => {
    addFood(mealType, food);
    onFoodLogged(); // Dismiss empty state card
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
        </div>
      </header>

      {/* Layer 4: Meal Time Banner */}
      <MealTimeBanner
        show={showMealTimeBanner}
        mealWindow={currentMealWindow}
        onScanClick={handleOpenScanner}
        onDismiss={dismissMealTimeBanner}
      />

      {/* Layer 2: Re-engagement Banner */}
      <ReengagementBanner
        show={showReengagementSuggestion}
        onScanClick={handleOpenScanner}
        onDismiss={dismissReengagement}
      />

      {/* Summary Card */}
      <DashboardCard className="mx-4 sm:mx-5 md:mx-8 mb-4 sm:mb-6 glass-nutrition">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Calories Remaining</p>
              {hasAIPlan && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-nutrition/10 text-nutrition">
                  <Sparkles className="w-3 h-3" />
                  AI Plan
                </span>
              )}
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${caloriesRemaining >= 0 ? 'text-nutrition' : 'text-destructive'}`}>
              {Math.abs(caloriesRemaining)}
              <span className="text-sm sm:text-lg font-normal text-muted-foreground ml-1">
                {caloriesRemaining < 0 ? 'over' : 'left'}
              </span>
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
              <span className="text-muted-foreground">
                {hasAIPlan ? 'AI Plan Goal' : 'Goal'}: <span className="text-foreground font-medium">{profile.goals.calorieGoal}</span>
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

      {/* Tools Section - Calculator & Macros */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-nutrition" />
          Nutrition Tools
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCalculator(true)}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-nutrition/20 via-nutrition/10 to-transparent border border-nutrition/30 hover:border-nutrition/50 transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-nutrition/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-nutrition/20 flex items-center justify-center mb-2">
                <Calculator className="w-5 h-5 text-nutrition" />
              </div>
              <h3 className="font-semibold text-sm text-left">Calorie Calculator</h3>
              <p className="text-xs text-muted-foreground text-left mt-1">Calculate your daily needs</p>
              {profile.goals.calorieGoal > 0 && (
                <div className="mt-2 px-2 py-1 rounded-lg bg-nutrition/10 inline-block">
                  <span className="text-xs font-medium text-nutrition">{profile.goals.calorieGoal} cal/day</span>
                </div>
              )}
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMacroGoals(true)}
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 hover:border-primary/50 transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-left">Macro Goals</h3>
              <p className="text-xs text-muted-foreground text-left mt-1">Set protein, carbs & fat</p>
              {(profile.goals.macros?.protein || profile.goals.macros?.carbs || profile.goals.macros?.fat) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {profile.goals.macros?.protein && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">P:{profile.goals.macros.protein}g</span>
                  )}
                  {profile.goals.macros?.carbs && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">C:{profile.goals.macros.carbs}g</span>
                  )}
                  {profile.goals.macros?.fat && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400">F:{profile.goals.macros.fat}g</span>
                  )}
                </div>
              )}
            </div>
          </motion.button>
        </div>
      </div>


      {/* Today's Meals */}
      <div className="px-4 sm:px-5 md:px-8">
        {/* Layer 3: Empty State Card */}
        <EmptyStateCard
          show={showEmptyStateCard}
          onScanClick={handleOpenScanner}
        />
        
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

      {/* Floating AI Scan Button with First-Time Tooltip */}
      <FirstTimeTooltip
        show={showFirstTimeTooltip}
        onDismiss={dismissFirstTimeTooltip}
        onScanClick={handleOpenScanner}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenScanner}
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-nutrition to-nutrition-dark shadow-lg flex items-center justify-center"
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.button>
      </FirstTimeTooltip>

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
              <TabsTrigger value="scan" onClick={handleOpenScanner}>
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
              
              {/* Layer 5: Manual Entry Nudge */}
              <ManualEntryNudge onScanClick={handleOpenScanner} />
            </TabsContent>
            
            <TabsContent value="scan" className="flex-1">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Camera className="w-12 h-12 text-nutrition mb-4" />
                <p className="text-muted-foreground mb-4">Take a photo of your food to get instant nutritional analysis</p>
                <Button onClick={handleOpenScanner} className="bg-nutrition hover:bg-nutrition-dark">
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Food Scanner */}
      <FoodScanner
        open={showFoodScanner}
        onOpenChange={setShowFoodScanner}
        onAddFood={handleScannerAddFood}
        selectedMealType={selectedMealType}
      />

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
