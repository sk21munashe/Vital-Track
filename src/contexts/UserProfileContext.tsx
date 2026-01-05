import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileContextType {
  /** The user's display name (shown everywhere in the app) */
  displayName: string;
  /** The user's email/login identifier (unchangeable) */
  username: string | null;
  /** Whether the profile data is still loading */
  isLoading: boolean;
  /** Update display name with optimistic UI */
  updateDisplayName: (name: string) => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

const DEFAULT_DISPLAY_NAME = 'Health Warrior';

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState<string>(DEFAULT_DISPLAY_NAME);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          setUsername(user.email || null);
          
          // Fetch preferred_name from profiles table
          const { data: profileData } = await supabase
            .from('profiles')
            .select('preferred_name')
            .eq('user_id', user.id)
            .single();
          
          if (profileData?.preferred_name) {
            setDisplayName(profileData.preferred_name);
          }
        }
      } catch (err) {
        console.error('[UserProfile] Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        setUsername(session.user.email || null);
        // Reload profile data on sign in
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setUsername(null);
        setDisplayName(DEFAULT_DISPLAY_NAME);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update display name with optimistic UI
  const updateDisplayName = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Store previous value for rollback
    const previousName = displayName;

    // Optimistic update - immediately update UI
    setDisplayName(trimmedName);

    // Persist to database
    if (userId) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_name: trimmedName })
          .eq('user_id', userId);

        if (error) {
          console.error('[UserProfile] Error updating display name:', error);
          // Rollback on error
          setDisplayName(previousName);
          throw error;
        }
      } catch (err) {
        // Rollback on error
        setDisplayName(previousName);
        throw err;
      }
    }
  }, [userId, displayName]);

  return (
    <UserProfileContext.Provider
      value={{
        displayName,
        username,
        isLoading,
        updateDisplayName,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
