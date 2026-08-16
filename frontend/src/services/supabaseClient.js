import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/^["']|["']$/g, '').trim();
if (supabaseUrl && !/^https?:\/\//i.test(supabaseUrl)) {
  supabaseUrl = `https://${supabaseUrl}`;
}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.replace(/^["']|["']$/g, '').trim();

const hasSupabaseConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes('your_supabase') &&
  !supabaseAnonKey.includes('your_supabase');

export const isSupabaseConfigured = Boolean(hasSupabaseConfig);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false, // Disabled to prevent race conditions with manual exchangeCodeForSession
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
