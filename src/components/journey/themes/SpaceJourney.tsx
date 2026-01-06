import { motion } from 'framer-motion';
import { Droplets, Zap } from 'lucide-react';
import { JourneyData } from '../types';

interface SpaceJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function SpaceJourney({ data, onWaterClick, onCaloriesClick }: SpaceJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
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
      <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />

      {/* Central progress ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.8)" />
              <stop offset="50%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.8)" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ 
              strokeDashoffset: 2 * Math.PI * 42 * (1 - combinedProgress / 100)
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ 
              transformOrigin: 'center',
              transform: 'rotate(-90deg)'
            }}
          />
        </svg>
        
        {/* Center percentage */}
        <motion.div 
          className="absolute flex flex-col items-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <span className="text-4xl font-bold text-white">{Math.round(combinedProgress)}%</span>
          <span className="text-xs text-slate-400 mt-1">Daily Progress</span>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-cyan-400/60 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Progress gauges */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
        {/* Water Gauge */}
        <motion.button
          onClick={onWaterClick}
          className="flex-1 max-w-44 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30"
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Water</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Calories Gauge */}
        <motion.button
          onClick={onCaloriesClick}
          className="flex-1 max-w-44 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-green-500/30"
          whileHover={{ scale: 1.02, borderColor: 'rgba(34, 197, 94, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Calories</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.calories.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-300">
            {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
          </div>
        </motion.button>
      </div>
    </div>
  );
}
