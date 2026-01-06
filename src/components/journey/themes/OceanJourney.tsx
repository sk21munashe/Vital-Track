import { motion } from 'framer-motion';
import { JourneyData } from '../types';

interface OceanJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function OceanJourney({ data, onWaterClick, onCaloriesClick }: OceanJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  const diverDepth = (combinedProgress / 100) * 200;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-cyan-400 via-blue-500 to-slate-900">
      {/* Water surface effect */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-cyan-300/60 to-transparent"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Light rays from surface */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-8 bg-gradient-to-b from-cyan-200/40 to-transparent"
          style={{
            left: `${15 + i * 18}%`,
            height: 150 + Math.random() * 100,
            transform: `rotate(${-10 + i * 5}deg)`,
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Bubbles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/30"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${Math.random() * 100}%`,
            bottom: Math.random() * 50,
          }}
          animate={{ 
            y: [-300, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{ 
            duration: 4 + Math.random() * 3, 
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Depth gauge on left */}
      <div className="absolute left-4 top-20 bottom-24 w-8">
        <div className="h-full bg-slate-800/50 rounded-full border border-cyan-500/30 overflow-hidden relative">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-blue-400 rounded-full"
            initial={{ height: 0 }}
            animate={{ height: `${combinedProgress}%` }}
            transition={{ duration: 1 }}
          />
          {/* Depth markers */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-cyan-400/30"
              style={{ top: `${i * 25}%` }}
            />
          ))}
        </div>
        <div className="text-xs text-cyan-300 text-center mt-2 font-semibold">
          {Math.round(combinedProgress)}%
        </div>
      </div>

      {/* Diver */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 text-4xl z-10"
        initial={{ top: 60 }}
        animate={{ 
          top: 60 + diverDepth,
          x: [-5, 5, -5]
        }}
        transition={{ 
          top: { duration: 1 },
          x: { duration: 3, repeat: Infinity }
        }}
      >
        🤿
      </motion.div>

      {/* Diver bubbles trail */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 50 + diverDepth }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/40"
            style={{ left: 10 + i * 8 }}
            animate={{ 
              y: [-30, 0],
              opacity: [0.6, 0],
              scale: [0.5, 1.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </motion.div>

      {/* Sea creatures */}
      <motion.div 
        className="absolute text-3xl"
        style={{ top: '40%', right: '15%' }}
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        🐠
      </motion.div>
      <motion.div 
        className="absolute text-2xl"
        style={{ top: '55%', left: '20%' }}
        animate={{ x: [0, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🐟
      </motion.div>
      <motion.div 
        className="absolute text-4xl"
        style={{ top: '70%', right: '25%' }}
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        🦑
      </motion.div>

      {/* Ocean floor goal */}
      <motion.div 
        className="absolute bottom-28 left-1/2 -translate-x-1/2 text-center"
        animate={{ scale: combinedProgress >= 100 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 1, repeat: combinedProgress >= 100 ? Infinity : 0 }}
      >
        <span className="text-4xl">🐚</span>
        <span className="text-4xl">🦪</span>
        <span className="text-4xl">⚓</span>
        <div className="text-xs font-semibold text-cyan-200 mt-1">Ocean Floor</div>
      </motion.div>

      {/* Ocean floor */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-800 via-amber-900 to-transparent">
        {/* Coral and seaweed */}
        <div className="absolute bottom-0 left-8 text-2xl">🪸</div>
        <div className="absolute bottom-0 left-1/4 text-2xl">🌿</div>
        <div className="absolute bottom-0 right-1/4 text-2xl">🪸</div>
        <div className="absolute bottom-0 right-8 text-2xl">🌿</div>
      </div>

      {/* Progress meters */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Oxygen Tank */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-40 bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-cyan-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🫧</span>
            <span className="text-xs font-semibold text-cyan-400">OXYGEN TANK</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Energy */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-40 bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-green-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-semibold text-green-400">ENERGY</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.calories.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-300">
            {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
          </div>
        </motion.button>
      </div>
    </div>
  );
}
