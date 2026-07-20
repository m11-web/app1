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
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        return;
      }

      if (session?.user) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (existing) {
          setProfile(existing);
        } else {
          const newProfile: Profile = {
            id: session.user.id,
            email: session.user.email ?? '',
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User',
            role: 'customer',
            created_at: new Date().toISOString(),
          };
          await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
          setProfile(newProfile);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await clearLocalSession();
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
