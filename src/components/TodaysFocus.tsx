import { motion } from 'framer-motion';
import { Beef, Wheat, Droplet } from 'lucide-react';
import { useUserPlan } from '@/contexts/UserPlanContext';
import { useWellnessData } from '@/hooks/useWellnessData';

interface MacroRingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  delay: number;
}

function MacroRing({ label, current, target, unit, color, icon, delay }: MacroRingProps) {
  const progress = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-muted-foreground mb-0.5">
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {current}
            <span className="text-muted-foreground font-normal text-[10px] sm:text-xs">{unit}</span>
          </span>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xs sm:text-sm font-medium text-foreground">{label}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          of {target}{unit}
        </p>
      </div>
    </motion.div>
  );
}

export function TodaysFocus() {
  const { healthPlan } = useUserPlan();
  const { getTodayMeals } = useWellnessData();
  
  const todayMeals = getTodayMeals();
  
  // Calculate consumed macros from logged meals
  const consumedMacros = todayMeals.reduce(
    (acc, meal) => ({
      protein: acc.protein + (meal.foodItem.protein || 0),
      carbs: acc.carbs + (meal.foodItem.carbs || 0),
      fats: acc.fats + (meal.foodItem.fat || 0),
    }),
    { protein: 0, carbs: 0, fats: 0 }
  );
  
  // Get targets from AI plan or use defaults
  const macroTargets = healthPlan?.macros || {
    protein: 120,
    carbs: 200,
    fats: 65,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Today's Focus</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Daily Macros
        </span>
      </div>
      
      <div className="flex justify-around items-start">
        <MacroRing
          label="Protein"
          current={Math.round(consumedMacros.protein)}
          target={macroTargets.protein}
          unit="g"
          color="hsl(var(--nutrition))"
          icon={<Beef className="w-4 h-4" />}
          delay={0}
        />
        <MacroRing
          label="Carbs"
          current={Math.round(consumedMacros.carbs)}
          target={macroTargets.carbs}
          unit="g"
          color="hsl(var(--fitness))"
          icon={<Wheat className="w-4 h-4" />}
          delay={0.1}
        />
        <MacroRing
          label="Fats"
          current={Math.round(consumedMacros.fats)}
          target={macroTargets.fats}
          unit="g"
          color="hsl(var(--health))"
          icon={<Droplet className="w-4 h-4" />}
          delay={0.2}
        />
      </div>
      
      {!healthPlan && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Complete onboarding to get personalized macro targets
        </p>
      )}
    </motion.div>
  );
}