import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  User, 
  Target, 
  Utensils, 
  Activity, 
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HealthProfile, HealthPlan } from '@/types/healthCoach';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MealPlanReport } from '@/components/MealPlanReport';

const ONBOARDING_STEPS = [
  { id: 'personal', title: 'About You', icon: User },
  { id: 'goals', title: 'Your Goal', icon: Target },
  { id: 'diet', title: 'Diet', icon: Utensils },
  { id: 'activity', title: 'Activity', icon: Activity },
];

const HEALTH_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', emoji: '🔥', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop', description: 'Shed extra pounds' },
  { value: 'weight_gain', label: 'Weight Gain', emoji: '📈', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop', description: 'Build healthy mass' },
  { value: 'muscle_building', label: 'Muscle Building', emoji: '💪', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop', description: 'Gain strength' },
  { value: 'maintenance', label: 'Maintenance', emoji: '⚖️', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop', description: 'Stay balanced' },
];

const DIET_OPTIONS = [
  { value: 'standard', label: 'Balanced', emoji: '🍽️', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop' },
  { value: 'high_protein', label: 'High Protein', emoji: '🥩', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&h=200&fit=crop' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop' },
  { value: 'keto', label: 'Keto', emoji: '🥑', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🫒', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', emoji: '🪑', description: 'Little to no exercise' },
  { value: 'light', label: 'Light', emoji: '🚶', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', emoji: '🏃', description: '3-5 days/week' },
  { value: 'active', label: 'Active', emoji: '🏋️', description: '6-7 days/week' },
  { value: 'very_active', label: 'Athlete', emoji: '⚡', description: 'Intense training' },
];

export default function Auth() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'auth' | 'onboarding' | 'plan_report'>('auth');
  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<HealthPlan | null>(null);
  
  const [formData, setFormData] = useState<Partial<HealthProfile>>({
    gender: 'male',
    units: 'metric',
    healthGoal: 'maintenance',
    dietPreference: 'standard',
    activityLevel: 'moderate',
  });
  
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    preferredName: '',
  });

  // Unified auth success handler - decides routing based on onboarding status
  const handleAuthSuccess = async (userId: string, event: string) => {
    console.log('[Auth] handleAuthSuccess called:', { userId, event });
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('[Auth] Profile check result:', { profile, error, onboarding_completed: profile?.onboarding_completed });
    
    // Route based on onboarding completion status from database
    if (profile?.onboarding_completed === true) {
      console.log('[Auth] Onboarding complete - redirecting to dashboard');
      navigate('/');
    } else {
      console.log('[Auth] Onboarding not complete - showing onboarding flow');
      setAuthMode('onboarding');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[Auth] Existing session found on mount');
        await handleAuthSuccess(session.user.id, 'session_check');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange:', { event, hasSession: !!session });
      
      if (session) {
        // Defer the profile check to avoid deadlock
        setTimeout(() => {
          handleAuthSuccess(session.user.id, event);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAuth = async () => {
    if (!authData.email || !authData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLogin && !authData.preferredName.trim()) {
      toast.error('Please enter your preferred name');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // SIGN IN - existing user
        console.log('[Auth] Attempting sign in for:', authData.email);
        const { error } = await supabase.auth.signInWithPassword({
          email: authData.email,
          password: authData.password,
        });
        if (error) throw error;
        console.log('[Auth] Sign in successful');
        toast.success('Welcome back!');
        // onAuthStateChange will handle the routing via handleAuthSuccess
      } else {
        // SIGN UP - new user (onboarding_completed defaults to false in DB)
        console.log('[Auth] Attempting sign up for:', authData.email);
        const { error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              preferred_name: authData.preferredName.trim(),
            },
          },
        });
        if (error) throw error;
        console.log('[Auth] Sign up successful - new user will have onboarding_completed=false');
        toast.success('Account created! Let\'s personalize your experience.');
        // onAuthStateChange will handle the routing via handleAuthSuccess
      }
    } catch (error: any) {
      console.error('[Auth] Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    const completeProfile: HealthProfile = {
      gender: formData.gender || 'male',
      age: formData.age || 25,
      height: formData.height || 170,
      weight: formData.weight || 70,
      units: formData.units || 'metric',
      healthGoal: formData.healthGoal || 'maintenance',
      dietPreference: formData.dietPreference || 'standard',
      activityLevel: formData.activityLevel || 'moderate',
    };
    
    // Save profile to localStorage
    localStorage.setItem('wellness_health_profile', JSON.stringify(completeProfile));
    
    // Generate AI plan
    setIsGeneratingPlan(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-health-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(completeProfile),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const plan: HealthPlan = await response.json();
      setGeneratedPlan(plan);
      localStorage.setItem('wellness_health_plan', JSON.stringify(plan));
      
      // Show the meal plan report
      setAuthMode('plan_report');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Failed to generate plan. Proceeding to dashboard.');
      // Still complete onboarding even if plan generation fails
      await finalizeOnboarding();
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const finalizeOnboarding = async () => {
    // Update onboarding_completed in database
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', session.user.id);
      
      // Save health plan to database for sync across the app
      const completeProfile: HealthProfile = {
        gender: formData.gender || 'male',
        age: formData.age || 25,
        height: formData.height || 170,
        weight: formData.weight || 70,
        units: formData.units || 'metric',
        healthGoal: formData.healthGoal || 'maintenance',
        dietPreference: formData.dietPreference || 'standard',
        activityLevel: formData.activityLevel || 'moderate',
      };
      
      if (generatedPlan) {
        await supabase
          .from('user_health_plans')
          .insert([{
            user_id: session.user.id,
            health_profile: JSON.parse(JSON.stringify(completeProfile)),
            health_plan: JSON.parse(JSON.stringify(generatedPlan)),
          }]);
      }
    }
    
    // Set flag for welcome tour
    sessionStorage.setItem('just_completed_onboarding', 'true');
    localStorage.setItem('wellness_onboarding_complete', 'true');
    toast.success('Welcome to your wellness journey!');
    navigate('/');
  };

  const handleStartPlan = async () => {
    await finalizeOnboarding();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.gender && formData.age && formData.height && formData.weight;
      case 1: return formData.healthGoal;
      case 2: return formData.dietPreference;
      case 3: return formData.activityLevel;
      default: return false;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
  };

  // Meal Plan Report (after plan generation)
  if (authMode === 'plan_report' && generatedPlan) {
    const completeProfile: HealthProfile = {
      gender: formData.gender || 'male',
      age: formData.age || 25,
      height: formData.height || 170,
      weight: formData.weight || 70,
      units: formData.units || 'metric',
      healthGoal: formData.healthGoal || 'maintenance',
      dietPreference: formData.dietPreference || 'standard',
      activityLevel: formData.activityLevel || 'moderate',
    };
    
    return (
      <MealPlanReport 
        profile={completeProfile} 
        plan={generatedPlan} 
        onStartPlan={handleStartPlan}
      />
    );
  }

  // Onboarding Flow (after authentication)
  if (authMode === 'onboarding') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Progress Bar */}
        <div className="flex-shrink-0 pt-4 px-4">
          <div className="flex items-center gap-1 max-w-md mx-auto">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  index <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
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
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                    <p className="text-muted-foreground">This helps personalize your AI health plan</p>
                  </div>

                  {/* Gender Selection */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'male', emoji: '👨', label: 'Male' },
                      { value: 'female', emoji: '👩', label: 'Female' },
                      { value: 'other', emoji: '🧑', label: 'Other' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData(prev => ({ ...prev, gender: option.value as HealthProfile['gender'] }))}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all",
                          formData.gender === option.value
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:bg-muted/80"
                        )}
                      >
                        <span className="text-3xl block mb-1">{option.emoji}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Units Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50">
                    <div>
                      <span className="font-medium">Use Imperial Units</span>
                      <p className="text-xs text-muted-foreground">lbs, ft, in</p>
                    </div>
                    <Switch
                      checked={formData.units === 'imperial'}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, units: checked ? 'imperial' : 'metric' }))}
                    />
                  </div>

                  {/* Measurements */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Age</Label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={formData.age || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                        className="text-center text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{formData.units === 'metric' ? 'Height (cm)' : 'Height (in)'}</Label>
                      <Input
                        type="number"
                        placeholder={formData.units === 'metric' ? '170' : '67'}
                        value={formData.height || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || undefined }))}
                        className="text-center text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{formData.units === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</Label>
                      <Input
                        type="number"
                        placeholder={formData.units === 'metric' ? '70' : '154'}
                        value={formData.weight || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                        className="text-center text-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Health Goals */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">What's your goal?</h2>
                    <p className="text-muted-foreground">We'll tailor everything for you</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {HEALTH_GOALS.map((goal) => (
                      <motion.button
                        key={goal.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData(prev => ({ ...prev, healthGoal: goal.value as HealthProfile['healthGoal'] }))}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border-2 transition-all aspect-square",
                          formData.healthGoal === goal.value
                            ? "border-primary"
                            : "border-transparent"
                        )}
                      >
                        <img
                          src={goal.image}
                          alt={goal.label}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-left">
                          <span className="text-2xl">{goal.emoji}</span>
                          <p className="font-semibold">{goal.label}</p>
                          <p className="text-xs opacity-80">{goal.description}</p>
                        </div>
                        {formData.healthGoal === goal.value && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Diet Preference */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Diet preference?</h2>
                    <p className="text-muted-foreground">Pick what suits you best</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {DIET_OPTIONS.map((diet) => (
                      <motion.button
                        key={diet.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData(prev => ({ ...prev, dietPreference: diet.value as HealthProfile['dietPreference'] }))}
                        className={cn(
                          "relative overflow-hidden rounded-2xl border-2 transition-all h-28",
                          formData.dietPreference === diet.value
                            ? "border-primary"
                            : "border-transparent"
                        )}
                      >
                        <img
                          src={diet.image}
                          alt={diet.label}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-left flex items-center gap-2">
                          <span className="text-xl">{diet.emoji}</span>
                          <span className="font-medium text-sm">{diet.label}</span>
                        </div>
                        {formData.dietPreference === diet.value && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Activity Level */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">How active are you?</h2>
                    <p className="text-muted-foreground">This affects your calorie needs</p>
                  </div>

                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((level, index) => (
                      <motion.button
                        key={level.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({ ...prev, activityLevel: level.value as HealthProfile['activityLevel'] }))}
                        className={cn(
                          "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                          formData.activityLevel === level.value
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:bg-muted/80"
                        )}
                      >
                        <span className="text-3xl">{level.emoji}</span>
                        <div className="text-left flex-1">
                          <span className="font-semibold block">{level.label}</span>
                          <span className="text-sm text-muted-foreground">{level.description}</span>
                        </div>
                        {formData.activityLevel === level.value && (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✓</span>
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-lg border-t">
          <div className="max-w-md mx-auto flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button onClick={handleNext} disabled={!isStepValid()} className="flex-1">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleCompleteOnboarding}
                disabled={!isStepValid() || isGeneratingPlan}
                className="flex-1"
              >
                {isGeneratingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Your Plan...
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

  // Auth View (Sign In / Sign Up first)
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
          <p className="text-muted-foreground mt-1">
            {isLogin ? 'Sign in to continue your journey' : 'Create an account to begin'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={authData.email}
                onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && authData.password && authData.password.length < 6 && (
              <p className="text-xs text-destructive">Password must be at least 6 characters</p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label>Preferred Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What should we call you?"
                  value={authData.preferredName}
                  onChange={(e) => setAuthData(prev => ({ ...prev, preferredName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleAuth}
            disabled={isLoading || !authData.email || !authData.password || (!isLogin && authData.password.length < 6) || (!isLogin && !authData.preferredName.trim())}
            className="w-full h-12 text-base"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center">
          {[
            { emoji: '💧', label: 'Hydration' },
            { emoji: '🥗', label: 'Nutrition' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-2xl bg-muted/50">
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
