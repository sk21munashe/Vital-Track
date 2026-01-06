import { motion } from 'framer-motion';
import { JourneyData } from '../types';

interface MountainJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function MountainJourney({ data, onWaterClick, onCaloriesClick }: MountainJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  const climberPosition = (combinedProgress / 100) * 200;

  // Trail path points (creating a winding mountain trail)
  const trailPath = "M 50 280 Q 80 250 100 220 Q 120 190 150 160 Q 180 130 200 100 Q 220 70 250 40";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900">
      {/* Sky with clouds */}
      <motion.div 
        className="absolute top-8 left-10 text-4xl opacity-80"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      >
        ☁️
      </motion.div>
      <motion.div 
        className="absolute top-16 right-8 text-3xl opacity-60"
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      >
        ☁️
      </motion.div>

      {/* Sun */}
      <motion.div 
        className="absolute top-6 right-14"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-yellow-500/40" />
      </motion.div>

      {/* Mountain SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 320" preserveAspectRatio="none">
        {/* Background mountains */}
        <polygon 
          points="0,320 60,180 120,320" 
          className="fill-slate-400/40 dark:fill-slate-600/40"
        />
        <polygon 
          points="200,320 270,160 340,320" 
          className="fill-slate-400/30 dark:fill-slate-600/30"
        />

        {/* Main mountain */}
        <polygon 
          points="30,320 150,60 270,320" 
          className="fill-slate-500 dark:fill-slate-700"
        />
        
        {/* Snow cap */}
        <polygon 
          points="120,100 150,60 180,100 170,110 150,95 130,110" 
          className="fill-white dark:fill-slate-200"
        />

        {/* Trail path */}
        <path
          d={trailPath}
          fill="none"
          stroke="rgba(139, 69, 19, 0.6)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
      </svg>

      {/* Trail markers */}
      {[0, 25, 50, 75, 100].map((percent, i) => {
        const y = 280 - (percent / 100) * 240;
        const x = 50 + (percent / 100) * 200 + Math.sin(percent / 20) * 30;
        return (
          <motion.div
            key={i}
            className={`absolute w-3 h-3 rounded-full border-2 ${
              combinedProgress >= percent 
                ? 'bg-emerald-500 border-emerald-600' 
                : 'bg-slate-300 border-slate-400'
            }`}
            style={{ left: x, top: y }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        );
      })}

      {/* Climber */}
      <motion.div
        className="absolute text-3xl z-10"
        style={{
          left: 50 + (combinedProgress / 100) * 200 + Math.sin(combinedProgress / 20) * 30 - 15,
        }}
        initial={{ top: 270 }}
        animate={{ 
          top: 270 - climberPosition,
          rotate: [-5, 5, -5]
        }}
        transition={{ 
          top: { duration: 1 },
          rotate: { duration: 2, repeat: Infinity }
        }}
      >
        🧗
      </motion.div>

      {/* Summit flag (goal) */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ top: 30 }}
        animate={{ 
          scale: combinedProgress >= 100 ? [1, 1.2, 1] : 1,
          y: [0, -3, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-4xl">🏔️</span>
        <motion.div 
          className="absolute -top-2 left-1/2 text-2xl"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🚩
        </motion.div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Summit</div>
      </motion.div>

      {/* Trees at base */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-around px-8">
        {['🌲', '🌳', '🌲', '🌳', '🌲'].map((tree, i) => (
          <motion.span 
            key={i} 
            className="text-2xl"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            {tree}
          </motion.span>
        ))}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-600 to-emerald-500 dark:from-slate-800 dark:to-slate-700" />

      {/* Progress meters */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Canteen */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-sky-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🥤</span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">CANTEEN</span>
          </div>
          <div className="h-3 bg-sky-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Supplies */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-amber-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎒</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">SUPPLIES</span>
          </div>
          <div className="h-3 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.calories.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
          </div>
        </motion.button>
      </div>
    </div>
  );
}
