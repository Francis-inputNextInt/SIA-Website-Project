/**
 * Supabase Client — SESSION PERSISTENCE ONLY
 *
 * This anon-key client exists in the browser for exactly one documented
 * purpose: persisting the auth session and auto-refreshing the access token
 * (see Supabase docs). It performs NO auth logic and NO database writes.
 *
 *   - Auth logic & business rules run on the backend with the service-role key
 *     (backend/src/config/supabase.js).
 *   - The frontend hands backend-issued tokens to this client via
 *     `supabase.auth.setSession(...)` and reads a fresh access token via
 *     `supabase.auth.getSession()` for authenticated API calls.
 *
 * Reads credentials from frontend/.env.local:
 *   VITE_SUPABASE_URL      – project API URL
 *   VITE_SUPABASE_ANON_KEY – public anon key (safe for browser use)
 */
import { createClient } from '@supabase/supabase-js';

// `import.meta.env` only exists in Vite; fall back to an empty object so this
// module can also be imported by plain Node.js (e.g. unit tests).
const env = import.meta.env ?? {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Only warn inside the browser (Node/test environments have no Vite env).
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in frontend/.env.local');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;