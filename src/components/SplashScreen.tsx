import { motion } from "framer-motion";
import { Activity, Droplets, Flame } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2 }}
      onAnimationComplete={onComplete}
    >
      {/* Animated Logo */}
      <motion.div
        className="relative mb-6"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1, bounce: 0.4 }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl">
          <Activity className="w-12 h-12 text-primary-foreground" />
        </div>
        
        {/* Orbiting icons */}
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-water flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Droplets className="w-4 h-4 text-white" />
        </motion.div>
        
        <motion.div
          className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-fitness flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <Flame className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        className="text-3xl font-bold text-foreground mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        VitalTrack
      </motion.h1>
      
      <motion.p
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Your Daily Wellness Companion
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        className="mt-8 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
