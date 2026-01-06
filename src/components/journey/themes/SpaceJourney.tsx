import { motion } from 'framer-motion';
import { JourneyData } from '../types';

interface SpaceJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function SpaceJourney({ data, onWaterClick, onCaloriesClick }: SpaceJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  
  // Rocket position along orbital path (0-100%)
  const rocketAngle = (combinedProgress / 100) * 270 - 135; // Start from bottom-left, end at top
  const orbitRadius = 120;
  const centerX = 150;
  const centerY = 160;
  
  const rocketX = centerX + orbitRadius * Math.cos((rocketAngle * Math.PI) / 180);
  const rocketY = centerY + orbitRadius * Math.sin((rocketAngle * Math.PI) / 180);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ 
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl" />

      {/* Orbital path */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 320">
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
        </defs>
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={orbitRadius}
          ry={orbitRadius}
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />
      </svg>

      {/* Planets */}
      <motion.div 
        className="absolute text-4xl"
        style={{ left: centerX - 20, top: centerY - 20 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        🪐
      </motion.div>
      
      {/* Goal planet at top */}
      <motion.div 
        className="absolute left-1/2 top-8 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <span className="text-4xl">🌍</span>
        <span className="text-xs font-semibold text-purple-300 mt-1">Final Planet</span>
      </motion.div>

      {/* Rocket - animated along path */}
      <motion.div
        className="absolute text-3xl z-10"
        style={{ 
          left: rocketX - 15,
          top: rocketY - 15,
          rotate: rocketAngle + 45
        }}
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🚀
      </motion.div>

      {/* Rocket trail */}
      <motion.div
        className="absolute w-8 h-2 bg-gradient-to-r from-orange-500 to-transparent rounded-full blur-sm"
        style={{
          left: rocketX - 30,
          top: rocketY - 4,
          rotate: rocketAngle + 180,
          transformOrigin: 'right center'
        }}
        animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Progress gauges */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-6 px-4">
        {/* Fuel Gauge (Water) */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-40 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30"
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⛽</span>
            <span className="text-xs font-semibold text-cyan-400">FUEL</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Energy Gauge (Calories) */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-40 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30"
          whileHover={{ scale: 1.02, borderColor: 'rgba(249, 115, 22, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-semibold text-orange-400">ENERGY</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.calories.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
          </div>
        </motion.button>
      </div>

      {/* Progress percentage */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="text-2xl font-bold text-white">{Math.round(combinedProgress)}%</span>
        <span className="text-xs text-purple-300 ml-1">Mission Progress</span>
      </motion.div>
    </div>
  );
}
