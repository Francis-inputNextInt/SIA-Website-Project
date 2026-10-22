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
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

let adminClient = null;

/**
 * Returns the server-side Supabase admin client (service_role).
 * Returns null if credentials are not configured.
 */
export function getAdminClient() {
  if (adminClient) return adminClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const hasUrl = !!supabaseUrl;
  const hasKey = !!supabaseServiceKey;

  if (!hasUrl || !hasKey) {
    console.warn(
      '[supabase-config] SUPABASE_URL present: ' + hasUrl + ', SUPABASE_SERVICE_ROLE_KEY present: ' + hasKey + '. ' +
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

/**
 * Returns a fresh server-side Supabase service-role client for database queries
 * that must bypass RLS without sharing auth state with auth.getUser().
 */
export function getDbClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}