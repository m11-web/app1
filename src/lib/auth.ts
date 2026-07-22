import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { Profile } from './types';

// ─── Local Auth Session (persist admin/employee login across app restarts) ────
const LOCAL_SESSION_KEY = 'rena_local_session';

export async function saveLocalSession(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
  } catch {}
}

export async function loadLocalSession(): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearLocalSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {}
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
    if (error.message.toLowerCase().includes('already registered')) {
      return { profile: null, error: 'Yeh email pehle se registered hai. Sign In karo.' };
    }
    return { profile: null, error: error.message };
  }

  if (data.user && data.user.identities?.length === 0) {
    return { profile: null, error: 'Yeh email pehle se registered hai. Sign In karo.' };
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: 'customer',
    }, { onConflict: 'id' });
  }

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

  return { profile: null, error: null, needsConfirmation: true };
}

// ─── Google Sign In ───────────────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const redirectUrl = Linking.createURL('/');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const emailLower = email.toLowerCase().trim();

  // 1. Try Supabase auth first — works for ALL users created via website/app signup
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  });

  if (!authError && authData.user) {
    // Auth succeeded — fetch profile (role, name, etc.) from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profile) {
      // Admin/employee: persist session locally for fast role checks
      if (profile.role === 'admin' || profile.role === 'employee') {
        await saveLocalSession(profile);
        return { profile, error: null, isLocalAuth: false };
      }
      return { profile, error: null };
    }

    // Auth user exists but no profile row yet — create a basic one
    const newProfile = {
      id: authData.user.id,
      email: emailLower,
      full_name: authData.user.user_metadata?.full_name || emailLower.split('@')[0],
      role: 'customer' as const,
      created_at: new Date().toISOString(),
    };
    await supabase.from('profiles').insert(newProfile);
    return { profile: newProfile, error: null };
  }

  // 2. Fallback: local_password check in DB (for admin/employee added directly in-app
  //    who don't have a Supabase auth account)
  const { data: localProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', emailLower)
    .in('role', ['admin', 'employee'])
    .single();

  if (localProfile && localProfile.local_password) {
    if (localProfile.local_password !== password) {
      return { profile: null, error: 'Incorrect password.' };
    }
    await saveLocalSession(localProfile);
    return { profile: localProfile, error: null, isLocalAuth: true };
  }

  // 3. Nothing matched — return the original Supabase auth error
  return { profile: null, error: authError?.message ?? 'Invalid login credentials.' };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await clearLocalSession();
  await supabase.auth.signOut();
}

// ─── Get Current Profile ──────────────────────────────────────────────────────
export async function getCurrentProfile(): Promise<Profile | null> {
  const local = await loadLocalSession();
  if (local) {
    const { data } = await supabase.from('profiles').select('*').eq('id', local.id).single();
    if (data) {
      await saveLocalSession(data);
      return data;
    }
    return local;
  }

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
export async function changeLocalPassword(
  profileId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ error: string | null }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('local_password')
    .eq('id', profileId)
    .single();

  if (!profile) return { error: 'Profile not found.' };
  if (profile.local_password !== currentPassword) return { error: 'Current password is incorrect.' };
  if (newPassword.length < 6) return { error: 'New password must be at least 6 characters.' };

  const { error } = await supabase
    .from('profiles')
    .update({ local_password: newPassword })
    .eq('id', profileId);

  if (error) return { error: error.message };
  return { error: null };
}
