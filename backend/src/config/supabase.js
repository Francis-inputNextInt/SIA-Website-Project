/**
 * Server-Side Supabase Client (Server-Only — SECRET)
 *
 * Uses the service_role key for privileged operations (bypasses RLS).
 * The server enforces row ownership itself (e.g. a user may only update
 * their own profile row).
 *
 * Credentials are read from backend/.env:
 *   SUPABASE_URL             – project URL
 *   SUPABASE_SERVICE_ROLE_KEY – secret admin key (server-only, never shipped to the frontend)
 *
 * Note: user-scoped sign-ins performed with this client still return
 * user-scoped JWTs — GoTrue signs sessions for the end-user, not for the
 * service role.
 */
import { createClient } from '@supabase/supabase-js';

let adminClient = null;

/**
 * Returns the server-side Supabase admin client (service_role).
 * Returns null if credentials are not configured.
 */
export function getAdminClient() {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      '[supabase-config] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in backend/.env. ' +
      'Server-side Supabase operations are disabled.'
    );
    return null;
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}