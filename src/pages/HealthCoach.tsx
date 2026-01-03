import { useHealthCoach } from '@/hooks/useHealthCoach';
import { HealthCoachOnboarding } from '@/components/HealthCoachOnboarding';
import { MyPlanDashboard } from '@/components/MyPlanDashboard';
import { HealthProfile } from '@/types/healthCoach';
import { toast } from 'sonner';

export default function HealthCoach() {
  const {
    healthProfile,
    healthPlan,
    isOnboardingComplete,
    isLoading,
    isLoaded,
    saveProfile,
    generatePlan,
    resetOnboarding,
  } = useHealthCoach();

  const handleComplete = async (profile: HealthProfile) => {
    try {
      saveProfile(profile);
      await generatePlan(profile);
      toast.success('Your personalized plan is ready!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate plan');
    }
  };

  const handleReset = () => {
    resetOnboarding();
    toast.info('Starting fresh! Let\'s create a new plan.');
  };

  // Show loading state while data is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show onboarding if not complete
  if (!isOnboardingComplete || !healthPlan || !healthProfile) {
    return (
      <HealthCoachOnboarding
        onComplete={handleComplete}
        isLoading={isLoading}
      />
    );
  }

  // Show the plan dashboard
  return (
    <MyPlanDashboard
      plan={healthPlan}
      profile={healthProfile}
      onReset={handleReset}
    />
  );
}
