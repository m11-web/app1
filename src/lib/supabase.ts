import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://istgikavacmieckikydt.supabase.co';
const supabaseAnonKey = 'sb_publishable__Jjq1DLiPvnpqe22jUhCRw_E_-Qw9_2';

// On web, use Supabase's built-in localStorage adapter (avoids AsyncStorage
// initialization hang). On native, use AsyncStorage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    ...(Platform.OS !== 'web' && { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
