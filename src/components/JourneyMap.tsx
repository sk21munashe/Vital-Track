import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Utensils, Heart, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JourneyMapProps {
  waterProgress: number;
  caloriesProgress: number;
  wellnessProgress: number;
  waterValue: string;
  caloriesValue: string;
  wellnessValue: string;
  onWaterClick: () => void;
  onWellnessClick: () => void;
}

interface MilestoneProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress: number;
  isCompleted: boolean;
  position: { x: number; y: number };
  delay: number;
  onClick?: () => void;
}

function Milestone({ icon, label, value, progress, isCompleted, position, delay, onClick }: MilestoneProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1.5 group cursor-pointer"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect for completed */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 -m-2 rounded-full bg-accent/20 blur-xl"
          />
        )}
      </AnimatePresence>
      
      {/* Icon container */}
      <motion.div
        className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
          isCompleted
            ? 'bg-accent/20 border-2 border-accent shadow-[0_0_20px_rgba(var(--accent),0.3)]'
            : progress > 0
            ? 'bg-muted/80 border-2 border-border/60'
            : 'bg-muted/50 border border-border/40'
        }`}
        animate={isCompleted ? { 
          boxShadow: ['0 0 20px hsl(var(--accent) / 0.2)', '0 0 30px hsl(var(--accent) / 0.4)', '0 0 20px hsl(var(--accent) / 0.2)']
        } : {}}
        transition={{ duration: 2, repeat: isCompleted ? Infinity : 0 }}
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="hsl(var(--border) / 0.3)"
            strokeWidth="2"
          />
          <motion.circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke={isCompleted ? "hsl(var(--accent))" : "hsl(var(--muted-foreground) / 0.5)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={138}
            initial={{ strokeDashoffset: 138 }}
            animate={{ strokeDashoffset: 138 - (progress / 100) * 138 }}
            transition={{ duration: 1, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        
        <div className={`transition-colors duration-300 ${
          isCompleted ? 'text-accent' : 'text-muted-foreground'
        }`}>
          {icon}
        </div>
      </motion.div>
      
      {/* Label and value */}
      <div className="text-center">
        <p className={`text-xs font-medium transition-colors duration-300 ${
          isCompleted ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground">{value}</p>
      </div>
    </motion.button>
  );
}

export function JourneyMap({
  waterProgress,
  caloriesProgress,
  wellnessProgress,
  waterValue,
  caloriesValue,
  wellnessValue,
  onWaterClick,
  onWellnessClick,
}: JourneyMapProps) {
  const navigate = useNavigate();
  
  // Calculate overall progress (average of all milestones)
  const overallProgress = useMemo(() => {
    return (waterProgress + caloriesProgress + wellnessProgress) / 3;
  }, [waterProgress, caloriesProgress, wellnessProgress]);
  
  // Calculate marker position along the path
  const markerPosition = useMemo(() => {
    // Path goes: start (10%) -> water (30%) -> calories (50%) -> wellness (70%) -> finish (90%)
    const segments = [
      { threshold: 0, start: 10, end: 30 },
      { threshold: 33, start: 30, end: 50 },
      { threshold: 66, start: 50, end: 70 },
      { threshold: 100, start: 70, end: 90 },
    ];
    
    if (overallProgress >= 100) return 90;
    
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const nextThreshold = segments[i + 1]?.threshold || 100;
      if (overallProgress <= nextThreshold) {
        const segProgress = (overallProgress - seg.threshold) / (nextThreshold - seg.threshold);
        return seg.start + segProgress * (seg.end - seg.start);
      }
    }
    return 10;
  }, [overallProgress]);

  const allComplete = waterProgress >= 100 && caloriesProgress >= 100 && wellnessProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card/95 to-muted/20 p-6 sm:p-8 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Today's Journey</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Track your daily wellness goals</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{Math.round(overallProgress)}% complete</span>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      
      {/* Journey visualization */}
      <div className="relative h-40 sm:h-48">
        {/* Path line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--border))" />
              <stop offset="50%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
              <stop offset="100%" stopColor="hsl(var(--border))" />
            </linearGradient>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
          
          {/* Background path */}
          <motion.path
            d="M 10% 50% Q 25% 30%, 35% 50% T 60% 50% T 85% 50% L 95% 50%"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* Progress path overlay */}
          <motion.path
            d="M 10% 50% Q 25% 30%, 35% 50% T 60% 50% T 85% 50% L 95% 50%"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: overallProgress / 100 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Animated marker */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent)/0.6)] z-20"
          style={{ top: '50%', transform: 'translate(-50%, -50%)' }}
          initial={{ left: '10%' }}
          animate={{ left: `${markerPosition}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-accent"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Start point */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute left-[10%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted-foreground/30 border border-border"
        />
        
        {/* Milestones */}
        <Milestone
          icon={<Droplets className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Hydration"
          value={waterValue}
          progress={waterProgress}
          isCompleted={waterProgress >= 100}
          position={{ x: 30, y: 50 }}
          delay={0.2}
          onClick={onWaterClick}
        />
        
        <Milestone
          icon={<Utensils className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Nutrition"
          value={caloriesValue}
          progress={caloriesProgress}
          isCompleted={caloriesProgress >= 100}
          position={{ x: 55, y: 50 }}
          delay={0.4}
          onClick={() => navigate('/calories')}
        />
        
        <Milestone
          icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
          label="Wellness"
          value={wellnessValue}
          progress={wellnessProgress}
          isCompleted={wellnessProgress >= 100}
          position={{ x: 80, y: 50 }}
          delay={0.6}
          onClick={onWellnessClick}
        />
        
        {/* Finish trophy */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className={`absolute right-[5%] top-1/2 -translate-y-1/2 transition-all duration-500 ${
            allComplete ? 'text-accent' : 'text-muted-foreground/30'
          }`}
        >
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          {allComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -inset-2 rounded-full bg-accent/20 blur-lg -z-10"
            />
          )}
        </motion.div>
      </div>
      
      {/* Completion message */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mt-4 pt-4 border-t border-border/50"
          >
            <p className="text-sm font-medium text-accent">All goals achieved today!</p>
            <p className="text-xs text-muted-foreground mt-0.5">Keep up the excellent work</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}