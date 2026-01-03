import { useState, useEffect } from 'react';
import { HealthProfile, HealthPlan } from '@/types/healthCoach';

const STORAGE_KEYS = {
  HEALTH_PROFILE: 'wellness_health_profile',
  HEALTH_PLAN: 'wellness_health_plan',
  ONBOARDING_COMPLETE: 'wellness_onboarding_complete',
};

export function useHealthCoach() {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem(STORAGE_KEYS.HEALTH_PROFILE);
    const storedPlan = localStorage.getItem(STORAGE_KEYS.HEALTH_PLAN);
    const storedOnboarding = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

    if (storedProfile) {
      setHealthProfile(JSON.parse(storedProfile));
    }
    if (storedPlan) {
      setHealthPlan(JSON.parse(storedPlan));
    }
    if (storedOnboarding === 'true') {
      setIsOnboardingComplete(true);
    }
    setIsLoaded(true);
  }, []);

  // Save profile to localStorage
  const saveProfile = (profile: HealthProfile) => {
    setHealthProfile(profile);
    localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, JSON.stringify(profile));
  };

  // Generate health plan from AI
  const generatePlan = async (profile: HealthProfile): Promise<HealthPlan> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-health-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(profile),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const plan: HealthPlan = await response.json();
      setHealthPlan(plan);
      localStorage.setItem(STORAGE_KEYS.HEALTH_PLAN, JSON.stringify(plan));
      
      // Mark onboarding as complete
      setIsOnboardingComplete(true);
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');

      return plan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset onboarding to start fresh
  const resetOnboarding = () => {
    setHealthProfile(null);
    setHealthPlan(null);
    setIsOnboardingComplete(false);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PLAN);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  };

  return {
    healthProfile,
    healthPlan,
    isOnboardingComplete,
    isLoading,
    error,
    isLoaded,
    saveProfile,
    generatePlan,
    resetOnboarding,
  };
}
