import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://istgikavacmieckikydt.supabase.co';
const supabaseAnonKey = 'sb_publishable__Jjq1DLiPvnpqe22jUhCRw_E_-Qw9_2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
