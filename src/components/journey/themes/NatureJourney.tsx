import { motion } from 'framer-motion';
import { JourneyData } from '../types';

interface NatureJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function NatureJourney({ data, onWaterClick, onCaloriesClick }: NatureJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  
  // Plant growth stages based on progress
  const plantHeight = (combinedProgress / 100) * 180;
  const leafCount = Math.floor(combinedProgress / 20);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 dark:from-emerald-950 dark:via-green-900 dark:to-slate-900">
      {/* Sun */}
      <motion.div 
        className="absolute top-6 right-8"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-yellow-500/50" />
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-6 bg-yellow-400/60 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '50% 0',
              transform: `translateX(-50%) rotate(${i * 45}deg) translateY(-40px)`
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </motion.div>

      {/* Clouds */}
      <motion.div 
        className="absolute top-12 left-8 text-4xl opacity-80"
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        ☁️
      </motion.div>
      <motion.div 
        className="absolute top-20 left-1/3 text-3xl opacity-60"
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      >
        ☁️
      </motion.div>

      {/* Mountains in background */}
      <div className="absolute bottom-32 left-0 right-0">
        <svg viewBox="0 0 300 100" className="w-full h-24 text-emerald-600/30 dark:text-emerald-800/40">
          <polygon points="0,100 50,40 100,100" fill="currentColor" />
          <polygon points="70,100 130,20 190,100" fill="currentColor" opacity="0.8" />
          <polygon points="150,100 220,50 300,100" fill="currentColor" opacity="0.6" />
        </svg>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-600 via-amber-700 to-transparent dark:from-amber-900 dark:via-amber-950" />

      {/* Grass */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-around">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 rounded-t-full"
            style={{ height: 20 + Math.random() * 15 }}
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>

      {/* Growing plant container - centered */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Leaves based on progress */}
        {leafCount > 0 && (
          <motion.div 
            className="relative"
            style={{ marginBottom: plantHeight - 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(Math.min(leafCount, 5))].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: i % 2 === 0 ? -30 : 10,
                  top: i * -25,
                }}
                initial={{ scale: 0, rotate: i % 2 === 0 ? -30 : 30 }}
                animate={{ 
                  scale: 1, 
                  rotate: i % 2 === 0 ? [-35, -25, -35] : [25, 35, 25]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🌿
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main stem */}
        <motion.div
          className="w-3 bg-gradient-to-t from-emerald-700 to-emerald-500 dark:from-emerald-600 dark:to-emerald-400 rounded-t-full"
          initial={{ height: 10 }}
          animate={{ height: Math.max(plantHeight, 20) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Pot */}
        <div className="relative">
          <div className="w-20 h-4 bg-amber-700 rounded-t-lg" />
          <div className="w-16 h-12 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-lg mx-auto" />
        </div>
      </div>

      {/* Full tree at top (goal) */}
      <motion.div 
        className="absolute top-16 left-1/2 -translate-x-1/2 text-center"
        animate={{ scale: combinedProgress >= 100 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 1, repeat: combinedProgress >= 100 ? Infinity : 0 }}
      >
        <span className="text-5xl">🌳</span>
        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">Full Growth</div>
      </motion.div>

      {/* Progress meters */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Hydration bar */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-sky-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💧</span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">HYDRATION</span>
          </div>
          <div className="h-3 bg-sky-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Sunlight bar */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-yellow-400/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">☀️</span>
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">SUNLIGHT</span>
          </div>
          <div className="h-3 bg-yellow-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
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
