import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Utensils, Plus, Search, Calculator, Apple, Coffee, Moon, Cookie } from 'lucide-react';
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
  const [selectedMealType, setSelectedMealType] = useState<FoodLog['mealType']>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    updateGoals,
  } = useWellnessData();

  const todayCalories = getTodayCalories();
  const todayMeals = getTodayMeals();
  const caloriesRemaining = profile.goals.calorieGoal - todayCalories;

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
      </DashboardCard>

      {/* Meal Type Buttons */}
      <div className="px-4 sm:px-5 md:px-8 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-nutrition" />
          Log a Meal
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
          
          return (
            <DashboardCard key={id} className="mb-3" delay={0.1}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-nutrition-light flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-nutrition" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">{label}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-nutrition">{totalCalories} cal</span>
              </div>
              {meals.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground truncate mr-2">{meal.foodItem.name}</span>
                      <span className="flex-shrink-0">{meal.foodItem.calories} cal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedMealType(id as FoodLog['mealType']);
                    setShowAddFood(true);
                  }}
                  className="w-full py-2 text-xs sm:text-sm text-muted-foreground hover:text-nutrition transition-colors"
                >
                  + Add {label.toLowerCase()}
                </button>
              )}
            </DashboardCard>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Foods</TabsTrigger>
              <TabsTrigger value="custom">Custom Entry</TabsTrigger>
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
          </Tabs>
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
