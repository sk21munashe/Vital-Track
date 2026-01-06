import { motion } from 'framer-motion';
import { Droplets, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { JourneyData } from '../types';

interface SpaceJourneyProps {
  data: JourneyData;
  onWaterClick: () => void;
  onCaloriesClick: () => void;
}

export function SpaceJourney({ data, onWaterClick, onCaloriesClick }: SpaceJourneyProps) {
  const combinedProgress = (data.water.progress + data.calories.progress) / 2;
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden transition-colors duration-500 ${
      isLightMode 
        ? 'bg-gradient-to-b from-sky-300 via-sky-400 to-blue-500' 
        : 'bg-gradient-to-b from-slate-950 via-indigo-950 to-purple-950'
    }`}>
      {/* Stars/Clouds background */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${isLightMode ? 'bg-white/70' : 'bg-white'}`}
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ 
              opacity: isLightMode ? [0.4, 0.8, 0.4] : [0.3, 1, 0.3],
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

      {/* Nebula/Cloud effects */}
      <div className={`absolute top-10 right-10 w-40 h-40 rounded-full blur-3xl ${
        isLightMode ? 'bg-white/40' : 'bg-purple-500/20'
      }`} />
      <div className={`absolute bottom-20 left-10 w-32 h-32 rounded-full blur-3xl ${
        isLightMode ? 'bg-white/30' : 'bg-blue-500/15'
      }`} />
      <div className={`absolute top-1/3 left-1/4 w-24 h-24 rounded-full blur-2xl ${
        isLightMode ? 'bg-yellow-200/30' : 'bg-cyan-500/10'
      }`} />

      {/* Central progress ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isLightMode ? "rgba(14, 165, 233, 0.9)" : "rgba(6, 182, 212, 0.8)"} />
              <stop offset="50%" stopColor={isLightMode ? "rgba(99, 102, 241, 0.9)" : "rgba(139, 92, 246, 0.8)"} />
              <stop offset="100%" stopColor={isLightMode ? "rgba(34, 197, 94, 0.9)" : "rgba(34, 197, 94, 0.8)"} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={isLightMode ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}
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
          <span className={`text-4xl font-bold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
            {Math.round(combinedProgress)}%
          </span>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-1 h-1 rounded-full ${isLightMode ? 'bg-sky-600/60' : 'bg-cyan-400/60'}`}
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
          className={`flex-1 max-w-44 backdrop-blur-sm rounded-xl p-4 border ${
            isLightMode 
              ? 'bg-white/70 border-cyan-500/50' 
              : 'bg-slate-900/80 border-cyan-500/30'
          }`}
          whileHover={{ scale: 1.02, borderColor: 'rgba(6, 182, 212, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Water</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.water.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className={`mt-2 text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
            {data.water.current.toLocaleString()} / {data.water.goal.toLocaleString()}ml
          </div>
        </motion.button>

        {/* Calories Gauge */}
        <motion.button
          onClick={onCaloriesClick}
          className={`flex-1 max-w-44 backdrop-blur-sm rounded-xl p-4 border ${
            isLightMode 
              ? 'bg-white/70 border-green-500/50' 
              : 'bg-slate-900/80 border-green-500/30'
          }`}
          whileHover={{ scale: 1.02, borderColor: 'rgba(34, 197, 94, 0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Calories</span>
          </div>
          <div className={`h-2.5 rounded-full overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${data.calories.progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          <div className={`mt-2 text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
            {data.calories.current.toLocaleString()} / {data.calories.goal.toLocaleString()} kcal
          </div>
        </motion.button>
      </div>
    </div>
  );
}
