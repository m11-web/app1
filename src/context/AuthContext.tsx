import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../lib/types';
import { supabase } from '../lib/supabase';
import { getCurrentProfile } from '../lib/auth';

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  setProfile: (p: Profile | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  setProfile: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setProfile(null);
      } else if (session?.user) {
        const p = await getCurrentProfile();
        setProfile(p);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ profile, loading, setProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
