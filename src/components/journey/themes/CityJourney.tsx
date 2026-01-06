import { motion } from 'framer-motion';
import { JourneyData } from '../types';

interface CityJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function CityJourney({ data, onWaterClick, onCaloriesClick }: CityJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  const floors = Math.floor(combinedProgress / 10);
  const buildingHeight = (combinedProgress / 100) * 200;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-orange-300 via-amber-200 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
      {/* Sunset/sunrise effect */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-orange-400/40 to-transparent dark:from-amber-900/30" />

      {/* Sun/Moon */}
      <motion.div 
        className="absolute top-10 right-10"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-slate-300 dark:to-slate-400 shadow-lg shadow-orange-500/30 dark:shadow-slate-500/30" />
      </motion.div>

      {/* Background buildings */}
      <div className="absolute bottom-20 left-0 right-0 flex items-end justify-around px-2">
        {[80, 60, 90, 50, 70, 85, 55, 75].map((height, i) => (
          <div
            key={i}
            className="bg-slate-400/50 dark:bg-slate-700/50 rounded-t-sm"
            style={{ width: 20 + Math.random() * 15, height: height }}
          >
            {/* Windows */}
            <div className="grid grid-cols-2 gap-1 p-1">
              {[...Array(Math.floor(height / 15))].map((_, j) => (
                <motion.div
                  key={j}
                  className="w-2 h-2 bg-yellow-300/60 dark:bg-yellow-400/40 rounded-sm"
                  animate={{ opacity: Math.random() > 0.3 ? 1 : [0.3, 1, 0.3] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main building under construction */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Crane */}
        <motion.div 
          className="relative"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-2 h-40 bg-yellow-500" style={{ marginBottom: -buildingHeight }} />
          <div className="absolute top-0 left-1 w-24 h-2 bg-yellow-500 origin-left" />
          <motion.div 
            className="absolute top-2 right-0 text-2xl"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏗️
          </motion.div>
        </motion.div>

        {/* Building being constructed */}
        <motion.div
          className="relative bg-gradient-to-b from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 rounded-t-lg overflow-hidden"
          style={{ width: 80 }}
          initial={{ height: 0 }}
          animate={{ height: buildingHeight }}
          transition={{ duration: 1 }}
        >
          {/* Floors with windows */}
          <div className="absolute inset-0 flex flex-col-reverse">
            {[...Array(floors)].map((_, i) => (
              <motion.div
                key={i}
                className="h-5 border-t border-slate-400/30 flex justify-around items-center px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {[...Array(4)].map((_, j) => (
                  <motion.div
                    key={j}
                    className="w-3 h-3 bg-amber-300/80 dark:bg-amber-400/60 rounded-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Foundation */}
        <div className="w-24 h-3 bg-slate-700 rounded-b-sm" />
      </div>

      {/* Goal - completed skyscraper */}
      <motion.div 
        className="absolute top-6 left-1/2 -translate-x-1/2 text-center"
        animate={{ scale: combinedProgress >= 100 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 1, repeat: combinedProgress >= 100 ? Infinity : 0 }}
      >
        <span className="text-5xl">🏢</span>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">Skyscraper</div>
      </motion.div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-500 to-slate-400 dark:from-slate-800 dark:to-slate-700" />
      <div className="absolute bottom-16 left-0 right-0 h-4 bg-slate-600 dark:bg-slate-900" />

      {/* Progress meters */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Water Supply */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-blue-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🚰</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">WATER SUPPLY</span>
          </div>
          <div className="h-3 bg-blue-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Materials */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 border border-amber-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧱</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">MATERIALS</span>
          </div>
          <div className="h-3 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
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
