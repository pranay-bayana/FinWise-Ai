// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { loadBackendEnv } from './env.js';

loadBackendEnv();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role for server‑side ops

const hasSupabaseConfig =
  supabaseUrl &&
  supabaseKey &&
  /^https?:\/\//i.test(supabaseUrl) &&
  !supabaseUrl.includes('your_supabase') &&
  !supabaseKey.includes('your_supabase');

const missingConfigMessage =
  'Supabase is not configured. Add real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY values to backend/.env.';

if (!hasSupabaseConfig) {
  console.warn(`[setup] ${missingConfigMessage}`);
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : new Proxy(
      {},
      {
        get() {
          throw new Error(missingConfigMessage);
        },
      }
    );
