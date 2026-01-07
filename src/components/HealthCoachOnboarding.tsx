import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, User, Target, Utensils, Activity, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HealthProfile } from '@/types/healthCoach';
import { cn } from '@/lib/utils';

interface HealthCoachOnboardingProps {
  onComplete: (profile: HealthProfile) => Promise<void>;
  isLoading: boolean;
}

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: User },
  { id: 'goals', title: 'Health Goal', icon: Target },
  { id: 'diet', title: 'Diet Preference', icon: Utensils },
  { id: 'activity', title: 'Activity Level', icon: Activity },
];

const HEALTH_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', emoji: '🔥', description: 'Shed extra pounds healthily' },
  { value: 'weight_gain', label: 'Weight Gain', emoji: '📈', description: 'Build healthy mass' },
  { value: 'muscle_building', label: 'Muscle Building', emoji: '💪', description: 'Gain strength & muscle' },
  { value: 'maintenance', label: 'Maintenance', emoji: '⚖️', description: 'Maintain current weight' },
];

const DIET_OPTIONS = [
  { value: 'standard', label: 'Standard', emoji: '🍽️', description: 'Balanced nutrition' },
  { value: 'high_protein', label: 'High Protein', emoji: '🥩', description: 'Protein-focused meals' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱', description: 'Plant-based only' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗', description: 'No meat' },
  { value: 'keto', label: 'Keto', emoji: '🥑', description: 'Low carb, high fat' },
  { value: 'paleo', label: 'Paleo', emoji: '🍖', description: 'Whole foods focus' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒', description: 'Heart-healthy diet' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', emoji: '🪑', description: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', emoji: '🚶', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', emoji: '🏃', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', emoji: '🏋️', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Extra Active', emoji: '⚡', description: 'Very hard exercise & physical job' },
];

export function HealthCoachOnboarding({ onComplete, isLoading }: HealthCoachOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<HealthProfile>>({
    gender: 'male',
    units: 'metric',
    healthGoal: 'maintenance',
    dietPreference: 'standard',
    activityLevel: 'moderate',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    if (!formData.age || !formData.height || !formData.weight) {
      return;
    }
    await onComplete(formData as HealthProfile);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.gender && formData.age && formData.height && formData.weight;
      case 1:
        return formData.healthGoal;
      case 2:
        return formData.dietPreference;
      case 3:
        return formData.activityLevel;
      default:
        return false;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 20);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    
    const contentEl = contentRef.current;
    if (contentEl) {
      contentEl.addEventListener('scroll', checkScrollable);
    }

    return () => {
      window.removeEventListener('resize', checkScrollable);
      if (contentEl) {
        contentEl.removeEventListener('scroll', checkScrollable);
      }
    };
  }, [currentStep]);

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex-shrink-0 pt-6 pb-4 px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">AI Health Coach</h1>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all",
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-6 sm:w-12 h-1 mx-1 sm:mx-2 rounded-full transition-colors",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* Content - Scrollable */}
      <div 
        ref={contentRef}
        className="flex-1 px-4 sm:px-6 pb-24 overflow-y-auto overscroll-contain scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="max-w-md mx-auto"
          >
            {/* Step 0: Personal Info */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                  <p className="text-muted-foreground">We'll use this to personalize your plan</p>
                </div>

                {/* Gender */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Gender</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setFormData(prev => ({ ...prev, gender: gender as HealthProfile['gender'] }))}
                        className={cn(
                          "p-3 sm:p-4 rounded-xl border-2 transition-all text-center",
                          formData.gender === gender
                            ? "border-primary bg-primary/10"
                            : "border-muted bg-card hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl mb-1 block">
                          {gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑'}
                        </span>
                        <span className="text-sm font-medium capitalize">{gender}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Units Toggle */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Units</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'metric', label: 'Metric', sub: 'kg / cm' },
                      { value: 'imperial', label: 'Imperial', sub: 'lbs / ft-in' },
                    ].map((unit) => (
                      <button
                        key={unit.value}
                        onClick={() => setFormData(prev => ({ ...prev, units: unit.value as 'metric' | 'imperial' }))}
                        className={cn(
                          "p-3 sm:p-4 rounded-xl border-2 transition-all",
                          formData.units === unit.value
                            ? "border-primary bg-primary/10"
                            : "border-muted bg-card hover:border-primary/50"
                        )}
                      >
                        <span className="font-medium block">{unit.label}</span>
                        <span className="text-xs text-muted-foreground">{unit.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age, Height, Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={formData.age || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.units === 'metric' ? 'Height (cm)' : 'Height (in)'}</Label>
                    <Input
                      type="number"
                      placeholder={formData.units === 'metric' ? '170' : '67'}
                      value={formData.height || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || undefined }))}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{formData.units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</Label>
                    <Input
                      type="number"
                      placeholder={formData.units === 'metric' ? '70' : '154'}
                      value={formData.weight || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Health Goal */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">What's your goal?</h2>
                  <p className="text-muted-foreground">We'll tailor your plan accordingly</p>
                </div>

                <div className="space-y-3">
                  {HEALTH_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData(prev => ({ ...prev, healthGoal: goal.value as HealthProfile['healthGoal'] }))}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left",
                        formData.healthGoal === goal.value
                          ? "border-primary bg-primary/10"
                          : "border-muted bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-3xl">{goal.emoji}</span>
                      <div>
                        <span className="font-semibold block">{goal.label}</span>
                        <span className="text-sm text-muted-foreground">{goal.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Diet Preference */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Your diet preference</h2>
                  <p className="text-muted-foreground">Choose what fits your lifestyle</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {DIET_OPTIONS.map((diet) => (
                    <button
                      key={diet.value}
                      onClick={() => setFormData(prev => ({ ...prev, dietPreference: diet.value as HealthProfile['dietPreference'] }))}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center",
                        formData.dietPreference === diet.value
                          ? "border-primary bg-primary/10"
                          : "border-muted bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl block mb-2">{diet.emoji}</span>
                      <span className="font-semibold block text-sm">{diet.label}</span>
                      <span className="text-xs text-muted-foreground">{diet.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Activity Level */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">How active are you?</h2>
                  <p className="text-muted-foreground">This affects your calorie needs</p>
                </div>

                <div className="space-y-3">
                  {ACTIVITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.value as HealthProfile['activityLevel'] }))}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left",
                        formData.activityLevel === level.value
                          ? "border-primary bg-primary/10"
                          : "border-muted bg-card hover:border-primary/50"
                      )}
                    >
                      <span className="text-3xl">{level.emoji}</span>
                      <div>
                        <span className="font-semibold block">{level.label}</span>
                        <span className="text-sm text-muted-foreground">{level.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xs text-muted-foreground">Scroll for more</span>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Fixed */}
      <div className="flex-shrink-0 p-4 bg-background/95 backdrop-blur-lg border-t safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!isStepValid() || isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Plan
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
