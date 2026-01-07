import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Utensils, 
  Target, 
  Sparkles, 
  Trophy, 
  ChevronRight, 
  X,
  Flame,
  Camera,
  BarChart3,
  Heart,
  Settings,
  Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOUR_STORAGE_KEY = 'wellness_tour_completed';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  highlight?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Wellness Journey!',
    description: 'We\'re excited to have you here! Let us show you around the app so you can start tracking your health goals.',
    icon: Sparkles,
    color: 'from-primary to-accent',
    highlight: 'Get a quick tour of all features',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your home base! See your daily progress, journey map, and quick stats all in one place.',
    icon: BarChart3,
    color: 'from-indigo-500 to-purple-500',
    highlight: 'View at: Home screen',
  },
  {
    id: 'journey',
    title: 'Today\'s Journey',
    description: 'Watch your progress come alive! The animated journey shows how close you are to hitting your daily goals.',
    icon: Map,
    color: 'from-violet-500 to-purple-500',
    highlight: 'Animated progress visualization',
  },
  {
    id: 'water',
    title: 'Track Your Hydration',
    description: 'Log your water intake easily with quick add buttons. Stay hydrated and watch your progress fill up!',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-500',
    highlight: 'Tap the water icon in the nav bar',
  },
  {
    id: 'meals',
    title: 'Log Your Meals',
    description: 'Track calories and nutrition by logging your meals. Search our food database or enter custom foods!',
    icon: Utensils,
    color: 'from-orange-500 to-amber-500',
    highlight: 'Tap the fork icon in the nav bar',
  },
  {
    id: 'scanner',
    title: 'AI Food Scanner',
    description: 'Take a picture of your food and let AI identify it! Get instant calorie and nutrition info.',
    icon: Camera,
    color: 'from-pink-500 to-rose-500',
    highlight: 'Camera icon in Calorie Tracker',
  },
  {
    id: 'goals',
    title: 'Personalized AI Goals',
    description: 'Your calorie and water goals are set by AI based on your profile. View them anytime in your profile!',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    highlight: 'Profile > Daily Goals',
  },
  {
    id: 'wellness',
    title: 'Wellness Check',
    description: 'Track your weight, view body metrics, and get AI-powered health insights in one place.',
    icon: Heart,
    color: 'from-red-500 to-pink-500',
    highlight: 'Tap the heart icon in the nav bar',
  },
  {
    id: 'streaks',
    title: 'Build Your Streak',
    description: 'Use the app daily to build your streak! The longer your streak, the more achievements you\'ll unlock.',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    highlight: 'Streak counter on home screen',
  },
  {
    id: 'achievements',
    title: 'Earn Achievements',
    description: 'Complete challenges and hit milestones to earn badges. Check your profile to see all your achievements!',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-500',
    highlight: 'Profile > Achievements section',
  },
  {
    id: 'settings',
    title: 'Customize Settings',
    description: 'Adjust units, notifications, and personal details. You can replay this tour anytime from Settings!',
    icon: Settings,
    color: 'from-gray-500 to-slate-500',
    highlight: 'Profile > Settings gear icon',
  },
];

interface WelcomeTourProps {
  onComplete: () => void;
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-4 pb-2">
              {TOUR_STEPS.map((_, index) => (
                <motion.div
                  key={index}
                  initial={false}
                  animate={{
                    width: index === currentStep ? 24 : 8,
                    backgroundColor: index <= currentStep ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                  className="h-2 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="px-6 py-4 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold mb-2"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm leading-relaxed mb-3"
              >
                {step.description}
              </motion.p>

              {/* Highlight hint */}
              {step.highlight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {step.highlight}
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`flex-1 ${currentStep === 0 ? 'w-full' : ''}`}
              >
                {isLastStep ? (
                  "Let's Go!"
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            {!isLastStep && (
              <div className="pb-4 text-center">
                <button
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                >
                  Skip tour
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useTourStatus() {
  const [showTour, setShowTour] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const justCompletedOnboarding = sessionStorage.getItem('just_completed_onboarding');
    const replayTour = sessionStorage.getItem('replay_tour');
    
    if (replayTour === 'true') {
      setShowTour(true);
      sessionStorage.removeItem('replay_tour');
    } else if (!tourCompleted && justCompletedOnboarding === 'true') {
      setShowTour(true);
      setIsNewUser(true);
      sessionStorage.removeItem('just_completed_onboarding');
    }
  }, []);

  const completeTour = () => {
    setShowTour(false);
    setIsNewUser(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  };

  return { showTour, isNewUser, completeTour, resetTour };
}