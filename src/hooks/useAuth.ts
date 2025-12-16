import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  preferred_name: string | null;
  avatar_type: string;
  avatar_value: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  const signUp = async (email: string, password: string, preferredName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          preferred_name: preferredName || null,
        },
      },
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  const updatePreferredName = async (preferredName: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ preferred_name: preferredName })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, preferred_name: preferredName } : null);
    }

    return { error };
  };

  const updateAvatar = async (avatarType: string, avatarValue: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_type: avatarType, avatar_value: avatarValue })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, avatar_type: avatarType, avatar_value: avatarValue } : null);
    }

    return { error };
  };

  // Get display name (preferred name or email prefix)
  const displayName = profile?.preferred_name || user?.email?.split('@')[0] || 'User';

  return {
    user,
    session,
    profile,
    loading,
    displayName,
    signUp,
    signIn,
    signOut,
    updatePreferredName,
    updateAvatar,
    refetchProfile: () => user && fetchProfile(user.id),
  };
}
