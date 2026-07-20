import { supabase } from './supabase';
import { Profile, Role } from './types';

// ─── Local credentials for admin / employee accounts ─────────────────────────
// These accounts exist in the profiles table with custom IDs (not Supabase auth UUIDs).
// Password is verified here locally; profile data is fetched from the DB.

const LOCAL_CREDS: { email: string; password: string }[] = [
  { email: 'haris@renahenna.com', password: 'haris17482' },
];

export interface AuthResult {
  profile: Profile | null;
  error: string | null;
  isLocalAuth?: boolean;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { profile: null, error: 'Please enter a valid email address.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { profile: null, error: error.message };

  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'customer',
    });
  }

  return {
    profile: {
      id: data.user?.id ?? '',
      email,
      full_name: fullName,
      role: 'customer',
      created_at: new Date().toISOString(),
    },
    error: null,
  };
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const emailLower = email.toLowerCase().trim();

  // 1. Check local credentials (admin / employee accounts)
  const localCred = LOCAL_CREDS.find(
    (c) => c.email.toLowerCase() === emailLower && c.password === password
  );

  if (localCred) {
    // Fetch the real profile from DB so name, role, etc. are accurate
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', emailLower)
      .single();

    if (profileError || !profile) {
      return { profile: null, error: 'Profile not found in database. Contact admin.' };
    }

    return { profile, error: null, isLocalAuth: true };
  }

  // 2. Regular Supabase auth (customers)
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailLower, password });
  if (error) return { profile: null, error: error.message };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return { profile: profile ?? null, error: null };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Get Current Profile ──────────────────────────────────────────────────────
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data ?? null;
}

// ─── Add Local Credential (for employee accounts added via admin) ─────────────
// Call this when admin creates a new employee so they can log in
export function addLocalCredential(email: string, password: string) {
  const exists = LOCAL_CREDS.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    LOCAL_CREDS.push({ email: email.toLowerCase(), password });
  }
}
