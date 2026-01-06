import { motion } from 'framer-motion';
import { JourneyData, ArchitectureStyle } from './types';

interface JourneyPathProps {
  data: JourneyData;
  theme: ArchitectureStyle;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

const themeConfig: Record<ArchitectureStyle, {
  goalIcon: string;
  goalLabel: string;
  todayIcon: string;
  bgGradient: string;
  pathColor: string;
  accentColor: string;
}> = {
  nature: {
    goalIcon: '🎯',
    goalLabel: 'Summit',
    todayIcon: '🌿',
    bgGradient: 'from-emerald-100 via-green-50 to-sky-100 dark:from-emerald-950 dark:via-green-900 dark:to-sky-950',
    pathColor: 'bg-amber-200 dark:bg-amber-700',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
  },
  space: {
    goalIcon: '🎯',
    goalLabel: 'Final Planet',
    todayIcon: '🌟',
    bgGradient: 'from-indigo-900 via-purple-900 to-slate-900 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-950',
    pathColor: 'bg-purple-400/50 dark:bg-purple-500/30',
    accentColor: 'text-purple-300 dark:text-purple-400',
  },
  fun: {
    goalIcon: '🏆',
    goalLabel: 'Finish Line',
    todayIcon: '🎮',
    bgGradient: 'from-pink-100 via-yellow-50 to-cyan-100 dark:from-pink-950 dark:via-yellow-900 dark:to-cyan-950',
    pathColor: 'bg-pink-300 dark:bg-pink-700',
    accentColor: 'text-pink-600 dark:text-pink-400',
  },
  minimalist: {
    goalIcon: '●',
    goalLabel: 'Goal',
    todayIcon: '─┼─',
    bgGradient: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    pathColor: 'bg-slate-300 dark:bg-slate-600',
    accentColor: 'text-slate-700 dark:text-slate-300',
  },
  scientific: {
    goalIcon: '🎯',
    goalLabel: 'Target',
    todayIcon: '📊',
    bgGradient: 'from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950',
    pathColor: 'bg-cyan-300 dark:bg-cyan-700',
    accentColor: 'text-cyan-600 dark:text-cyan-400',
  },
};

export function JourneyPath({ data, theme, onWaterClick, onCaloriesClick }: JourneyPathProps) {
  const config = themeConfig[theme];
  const combinedProgress = Math.round((data.water.progress + data.calories.progress) / 2);
  
  // Calculate yesterday's progress
  const yesterdayWater = data.water.history[data.water.history.length - 2]?.value || 0;
  const yesterdayCalories = data.calories.history[data.calories.history.length - 2]?.value || 0;
  const yesterdayWaterProgress = Math.min((yesterdayWater / data.water.goal) * 100, 100);
  const yesterdayCaloriesProgress = Math.min((yesterdayCalories / data.calories.goal) * 100, 100);
  const yesterdayProgress = Math.round((yesterdayWaterProgress + yesterdayCaloriesProgress) / 2);

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br ${config.bgGradient}`}>
      {/* Decorative elements based on theme */}
      {theme === 'nature' && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-200/50 dark:from-emerald-800/30 to-transparent" />
          <div className="absolute top-4 right-4 text-4xl opacity-30">🏔️</div>
          <div className="absolute bottom-4 left-4 text-2xl opacity-40">🌲🌲🌲</div>
          <div className="absolute bottom-8 right-8 text-xl opacity-30">💧</div>
        </>
      )}
      
      {theme === 'space' && (
        <>
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
              />
            ))}
          </div>
          <div className="absolute top-6 right-6 text-3xl opacity-40">🪐</div>
          <div className="absolute bottom-6 left-6 text-2xl opacity-30">🚀</div>
        </>
      )}
      
      {theme === 'fun' && (
        <>
          <div className="absolute top-4 left-4 text-2xl opacity-40">🎈</div>
          <div className="absolute bottom-4 right-4 text-2xl opacity-40">🎪</div>
          <motion.div 
            className="absolute top-1/4 right-8 text-xl opacity-30"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⭐
          </motion.div>
        </>
      )}

      {/* Journey Path */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 py-8">
        {/* Goal at top */}
        <motion.div 
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <motion.span 
              className="text-3xl"
              animate={combinedProgress >= 100 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: combinedProgress >= 100 ? Infinity : 0, repeatDelay: 2 }}
            >
              {config.goalIcon}
            </motion.span>
            {combinedProgress >= 100 && (
              <motion.div
                className="absolute -top-1 -right-1 text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                ✨
              </motion.div>
            )}
          </div>
          <span className={`text-xs font-medium mt-1 ${config.accentColor}`}>{config.goalLabel}</span>
        </motion.div>

        {/* Path line */}
        <div className={`w-1 flex-1 max-h-16 ${config.pathColor} rounded-full opacity-50`} />

        {/* Today's progress - main card */}
        <motion.div 
          className="bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/50 my-4 min-w-[200px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{config.todayIcon}</span>
            <span className="font-semibold text-foreground">Today</span>
            <span className={`ml-auto text-sm font-bold ${config.accentColor}`}>({combinedProgress}%)</span>
          </div>
          
          <div className="space-y-2">
            <motion.button
              onClick={onWaterClick}
              className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-water/10 transition-colors"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xs text-muted-foreground">Water:</span>
              <span className="text-sm font-medium text-foreground">
                {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
              </span>
            </motion.button>
            
            <motion.button
              onClick={onCaloriesClick}
              className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-nutrition/10 transition-colors"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xs text-muted-foreground">Calories:</span>
              <span className="text-sm font-medium text-foreground">
                {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Path line */}
        <div className={`w-1 flex-1 max-h-16 ${config.pathColor} rounded-full opacity-50`} />

        {/* Yesterday */}
        <motion.div 
          className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xs text-muted-foreground">Yesterday</span>
          <span className={`text-sm font-medium ${config.accentColor}`}>({yesterdayProgress}%)</span>
        </motion.div>
      </div>
    </div>
  );
}