import { supabase } from './supabase';
import { Profile, Role } from './types';

// ─── Local Auth Session (persist admin/employee login across page refresh) ────
const LOCAL_SESSION_KEY = 'rena_local_session';

export function saveLocalSession(profile: Profile) {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
}

export function loadLocalSession(): Profile | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearLocalSession() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export interface AuthResult {
  profile: Profile | null;
  error: string | null;
  isLocalAuth?: boolean;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult & { needsConfirmation?: boolean }> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { profile: null, error: 'Please enter a valid email address.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    // Already registered
    if (error.message.toLowerCase().includes('already registered')) {
      return { profile: null, error: 'Yeh email pehle se registered hai. Sign In karo.' };
    }
    return { profile: null, error: error.message };
  }

  // Email confirmation required (identities array empty means already exists)
  if (data.user && data.user.identities?.length === 0) {
    return { profile: null, error: 'Yeh email pehle se registered hai. Sign In karo.' };
  }

  if (data.user) {
    // Try to insert profile (ignore error if already exists)
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'customer',
    }, { onConflict: 'id' });
  }

  // If session exists → confirmed immediately (email confirm disabled in Supabase)
  if (data.session) {
    const profile: Profile = {
      id: data.user!.id,
      email,
      full_name: fullName,
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    return { profile, error: null };
  }

  // Email confirmation required
  return { profile: null, error: null, needsConfirmation: true };
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const emailLower = email.toLowerCase().trim();

  // 1. Check if this is an admin/employee account (has local_password in profiles)
  const { data: localProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', emailLower)
    .in('role', ['admin', 'employee'])
    .single();

  if (localProfile) {
    // Verify password against DB
    if (localProfile.local_password !== password) {
      return { profile: null, error: 'Incorrect password.' };
    }
    saveLocalSession(localProfile);
    return { profile: localProfile, error: null, isLocalAuth: true };
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
  clearLocalSession();
  await supabase.auth.signOut();
}

// ─── Get Current Profile ──────────────────────────────────────────────────────
export async function getCurrentProfile(): Promise<Profile | null> {
  // First check local session (admin/employee)
  const local = loadLocalSession();
  if (local) {
    // Re-fetch from DB to get latest data (in case password/name changed)
    const { data } = await supabase.from('profiles').select('*').eq('id', local.id).single();
    if (data) {
      saveLocalSession(data); // refresh stored session
      return data;
    }
    return local;
  }

  // Then check Supabase session (customers)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data ?? null;
}

// ─── Change Password (Admin/Employee) ────────────────────────────────────────
export async function changeLocalPassword(profileId: string, currentPassword: string, newPassword: string): Promise<{ error: string | null }> {
  // Verify current password
  const { data: profile } = await supabase.from('profiles').select('local_password').eq('id', profileId).single();
  if (!profile) return { error: 'Profile not found.' };
  if (profile.local_password !== currentPassword) return { error: 'Current password is incorrect.' };
  if (newPassword.length < 6) return { error: 'New password must be at least 6 characters.' };

  const { error } = await supabase.from('profiles').update({ local_password: newPassword }).eq('id', profileId);
  if (error) return { error: error.message };
  return { error: null };
}
