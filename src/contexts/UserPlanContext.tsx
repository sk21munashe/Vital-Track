import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HealthProfile, HealthPlan } from '@/types/healthCoach';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserPlanContextType {
  healthProfile: HealthProfile | null;
  healthPlan: HealthPlan | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  saveProfile: (profile: HealthProfile) => void;
  savePlan: (plan: HealthPlan) => Promise<void>;
  generatePlan: (profile: HealthProfile) => Promise<HealthPlan>;
  refreshPlan: () => Promise<void>;
  resetPlan: () => Promise<void>;
}

const UserPlanContext = createContext<UserPlanContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HEALTH_PROFILE: 'wellness_health_profile',
  HEALTH_PLAN: 'wellness_health_plan',
};

export function UserPlanProvider({ children }: { children: React.ReactNode }) {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [healthPlan, setHealthPlan] = useState<HealthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load data from database or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          // Try to load from database first
          const { data, error: fetchError } = await supabase
            .from('user_health_plans')
            .select('health_profile, health_plan')
            .eq('user_id', user.id)
            .maybeSingle();

          if (fetchError) {
            console.error('[UserPlan] Error fetching from DB:', fetchError);
          }

          if (data) {
            setHealthProfile(data.health_profile as unknown as HealthProfile);
            setHealthPlan(data.health_plan as unknown as HealthPlan);
            // Also update localStorage for offline access
            localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, JSON.stringify(data.health_profile));
            localStorage.setItem(STORAGE_KEYS.HEALTH_PLAN, JSON.stringify(data.health_plan));
          } else {
            // Fallback to localStorage if no DB data
            const storedProfile = localStorage.getItem(STORAGE_KEYS.HEALTH_PROFILE);
            const storedPlan = localStorage.getItem(STORAGE_KEYS.HEALTH_PLAN);
            
            if (storedProfile) setHealthProfile(JSON.parse(storedProfile));
            if (storedPlan) setHealthPlan(JSON.parse(storedPlan));
          }
        } else {
          // Not logged in, use localStorage only
          const storedProfile = localStorage.getItem(STORAGE_KEYS.HEALTH_PROFILE);
          const storedPlan = localStorage.getItem(STORAGE_KEYS.HEALTH_PLAN);
          
          if (storedProfile) setHealthProfile(JSON.parse(storedProfile));
          if (storedPlan) setHealthPlan(JSON.parse(storedPlan));
        }
      } catch (err) {
        console.error('[UserPlan] Error loading data:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        loadData();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save profile to localStorage (immediately) and mark for DB sync
  const saveProfile = useCallback((profile: HealthProfile) => {
    setHealthProfile(profile);
    localStorage.setItem(STORAGE_KEYS.HEALTH_PROFILE, JSON.stringify(profile));
  }, []);

  // Save plan to both localStorage and database
  const savePlan = useCallback(async (plan: HealthPlan) => {
    setHealthPlan(plan);
    localStorage.setItem(STORAGE_KEYS.HEALTH_PLAN, JSON.stringify(plan));

    if (userId && healthProfile) {
      try {
        // Check if record exists
        const { data: existing } = await supabase
          .from('user_health_plans')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('user_health_plans')
            .update({
              health_profile: JSON.parse(JSON.stringify(healthProfile)),
              health_plan: JSON.parse(JSON.stringify(plan)),
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('[UserPlan] Error updating DB:', updateError);
          } else {
            console.log('[UserPlan] Plan updated in database');
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('user_health_plans')
            .insert([{
              user_id: userId,
              health_profile: JSON.parse(JSON.stringify(healthProfile)),
              health_plan: JSON.parse(JSON.stringify(plan)),
            }]);

          if (insertError) {
            console.error('[UserPlan] Error inserting to DB:', insertError);
          } else {
            console.log('[UserPlan] Plan saved to database');
          }
        }
      } catch (err) {
        console.error('[UserPlan] Error syncing plan:', err);
      }
    }
  }, [userId, healthProfile]);

  // Generate plan from AI and save it
  const generatePlan = useCallback(async (profile: HealthProfile): Promise<HealthPlan> => {
    setIsLoading(true);
    setError(null);

    try {
      // Save the profile first
      saveProfile(profile);

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
      
      // Save to state, localStorage, and database
      await savePlan(plan);

      return plan;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveProfile, savePlan]);

  // Refresh plan using existing profile
  const refreshPlan = useCallback(async () => {
    if (!healthProfile) {
      toast.error('No health profile found');
      return;
    }

    try {
      await generatePlan(healthProfile);
      toast.success('Plan regenerated!');
    } catch (err) {
      toast.error('Failed to regenerate plan');
    }
  }, [healthProfile, generatePlan]);

  // Reset all plan data
  const resetPlan = useCallback(async () => {
    setHealthProfile(null);
    setHealthPlan(null);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.HEALTH_PLAN);

    if (userId) {
      try {
        await supabase
          .from('user_health_plans')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.error('[UserPlan] Error deleting from DB:', err);
      }
    }
  }, [userId]);

  return (
    <UserPlanContext.Provider
      value={{
        healthProfile,
        healthPlan,
        isLoading,
        isLoaded,
        error,
        saveProfile,
        savePlan,
        generatePlan,
        refreshPlan,
        resetPlan,
      }}
    >
      {children}
    </UserPlanContext.Provider>
  );
}

export function useUserPlan() {
  const context = useContext(UserPlanContext);
  if (context === undefined) {
    throw new Error('useUserPlan must be used within a UserPlanProvider');
  }
  return context;
}
