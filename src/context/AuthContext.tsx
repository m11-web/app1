import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../lib/types';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, clearLocalSession } from '../lib/auth';

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
        // Only clear if not a local session (admin/employee)
        const local = localStorage.getItem('rena_local_session');
        if (!local) setProfile(null);
      } else if (session?.user) {
        const p = await getCurrentProfile();
        setProfile(p);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    clearLocalSession();
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ profile, loading, setProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
