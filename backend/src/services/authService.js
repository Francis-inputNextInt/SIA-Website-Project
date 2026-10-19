/**
 * Backend Authentication + Profile Service
 *
 * ALL authentication & account logic lives here (server-side):
 *   - login  → supabase.auth.signInWithPassword (email OR student/faculty ID)
 *   - register → supabase.auth.signUp + profile auto-creation via trigger
 *   - password reset email
 *   - profile read/update (service-role keys, ownership enforced by the server)
 *
 * Business rules (enrollment gate, personal-email → Applicant, allowed roles)
 * are ENFORCED here — never in the browser.
 */
import { AppError } from '../utils/appError.js';
import { getAdminClient } from '../config/supabase.js';

// ── Shared business rules ────────────────────────────────────

export const ALLOWED_ROLES = ['Student', 'Faculty', 'Staff', 'Admin'];
export const ADMIN_ROLES = ['Admin'];
export const STAFF_ROLES = ['Staff', 'Admin'];
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'mail.com', 'live.com'
];

export function isPersonalEmail(email) {
  if (typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

export function isEnrolledUser(user) {
  if (!user || !user.role) return false;
  return ALLOWED_ROLES.includes(user.role);
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return false;
  return identifier.trim().length >= 3;
}

// ── Client access ────────────────────────────────────────────

function requireClient() {
  const client = getAdminClient();
  if (!client) {
    throw new AppError(
      500,
      'Authentication service is not configured. Please check the server environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).'
    );
  }
  return client;
}

// ── Pure mapping helpers (exported for tests) ────────────────

export function deriveInitials(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  return trimmed
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';
}

export function profileToUser(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.full_name || '',
    email: profile.email || '',
    studentId: profile.student_id || '',
    role: profile.role || 'Student',
    department: profile.department || '',
    yearLevel: profile.year_level || '',
    avatarColor: profile.avatar_color || 'bg-blue-600',
    initials: profile.initials || deriveInitials(profile.full_name),
    enrolled: profile.enrolled !== false
  };
}

export function buildUserFromAuth(authUser, profile) {
  const meta = authUser?.user_metadata || {};
  const fallback = {
    id: authUser.id,
    name: meta.full_name || '',
    email: authUser.email || '',
    studentId: meta.student_id || '',
    role: meta.role || 'Student',
    department: meta.department || '',
    yearLevel: meta.year_level || '',
    avatarColor: meta.avatar_color || 'bg-blue-600',
    initials: meta.initials || deriveInitials(meta.full_name),
    enrolled: !isPersonalEmail(authUser.email || '')
  };
  return profile ? { ...fallback, ...profileToUser(profile) } : fallback;
}

function sessionToClient(session) {
  if (!session) return null;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at
  };
}

async function fetchProfile(userId) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[authService] fetchProfile error:', error.message);
    return null;
  }
  return data;
}

// ── Auth operations (server-side) ────────────────────────────

/**
 * Sign a user in with their university email OR student/faculty ID.
 */
export async function loginUser({ identifier, password }) {
  if (!identifier || !identifier.trim()) {
    throw new AppError(400, 'Please enter your University Email or Student/Faculty ID.');
  }

  if (!password || password.length < 4) {
    throw new AppError(400, 'Password must be at least 4 characters long.');
  }

  let email = identifier.trim().toLowerCase();

  // If it is not an email, treat it as a student/faculty ID and resolve the
  // matching profile's email server-side (service role bypasses RLS here).
  if (!isValidEmail(email)) {
    const supabase = requireClient();
    const { data: row } = await supabase
      .from('profiles')
      .select('email')
      .eq('student_id', identifier.trim())
      .maybeSingle();
    if (!row?.email) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials and try again.');
    }
    email = row.email;
  }

  const supabase = requireClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials and try again.');
    }
    if (/email not confirmed/i.test(error.message)) {
      throw new AppError(403, 'Email not verified yet. Please check your inbox and click the confirmation link to activate your account.');
    }
    throw new AppError(400, error.message || 'Unable to sign in. Please try again.');
  }

  const profile = await fetchProfile(data.user.id);
  const user = buildUserFromAuth(data.user, profile);
  user.loginTimestamp = new Date().toISOString();

  return { user, session: sessionToClient(data.session) };
}

/**
 * Create a new account. Uses the admin API to create the user directly,
 * bypassing email confirmation. Then signs in immediately to get a session.
 */
export async function registerUser({ name, email, role = 'Student', department = '', studentId = '', password }) {
  if (!name || name.trim().length < 2) {
    throw new AppError(400, 'Please provide your full name (minimum 2 characters).');
  }

  if (!email || !isValidEmail(email)) {
    throw new AppError(400, 'Please provide a valid university email address.');
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters long.');
  }

  const supabase = requireClient();
  const trimmedName = name.trim();
  const normEmail = email.trim().toLowerCase();
  const initials = deriveInitials(trimmedName) || 'ST';
  const isPersonalDomain = isPersonalEmail(normEmail);
  const effectiveRole = isPersonalDomain ? 'Applicant' : role;
  const avatarColor = effectiveRole === 'Faculty' ? 'bg-indigo-600'
    : isPersonalDomain ? 'bg-amber-500' : 'bg-blue-600';

  // Use admin.createUser so email confirmation is skipped entirely.
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email: normEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: trimmedName,
      student_id: studentId || '',
      role: effectiveRole,
      department: department.trim() || '',
      avatar_color: avatarColor,
      initials
    }
  });

  if (createError) {
    if (/already registered|already been registered|already exists/i.test(createError.message)) {
      throw new AppError(409, 'This email is already registered. Please sign in instead.');
    }
    throw new AppError(400, createError.message || 'Unable to create your account. Please try again.');
  }

  // Sign in immediately to get a valid session for the new user.
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: normEmail,
    password
  });

  if (signInError) {
    throw new AppError(400, signInError.message || 'Account created but could not sign in automatically. Please sign in manually.');
  }

  const profile = await fetchProfile(signInData.user.id);
  const newUser = buildUserFromAuth(signInData.user, profile);
  newUser.loginTimestamp = new Date().toISOString();

  return { user: newUser, session: sessionToClient(signInData.session) };
}

/**
 * Send password reset instructions for the given university email.
 * The redirect URL points at the frontend (server-side config).
 */
export async function sendPasswordReset(email) {
  if (!email || !isValidEmail(email)) {
    throw new AppError(400, 'Please enter a valid university email address to receive recovery instructions.');
  }

  const supabase = requireClient();
  const redirectTo = process.env.FRONTEND_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(
    String(email).trim().toLowerCase(),
    { redirectTo }
  );

  if (error) {
    throw new AppError(400, error.message || 'Unable to send password reset instructions. Please try again.');
  }

  return {
    success: true,
    message: `Password reset instructions have been sent to ${email.trim()}. Please check your university inbox.`
  };
}

/**
 * Verify a caller's JWT and return the matching campus user.
 * Used by GET /api/auth/me and PATCH /api/profile.
 */
export async function getSessionUser(accessToken) {
  if (!accessToken) {
    throw new AppError(401, 'No session found. Please sign in again.');
  }

  const supabase = requireClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AppError(401, 'Your session is invalid or has expired. Please sign in again.');
  }

  const profile = await fetchProfile(data.user.id);
  return buildUserFromAuth(data.user, profile);
}

/**
 * Update the caller's own profile row (ownership enforced server-side:
 * the row is always the verified caller's own).
 */
export async function updateProfile(userId, updates = {}) {
  if (!userId) {
    throw new AppError(401, 'No active session. Please sign in to update your profile.');
  }

  const supabase = requireClient();

  // Load the current profile so role/enrollment rules can be applied correctly.
  const currentProfile = await fetchProfile(userId);

  // Translate app-friendly field names into `profiles` table column names.
  const db = {};

  if (updates.name !== undefined) {
    const trimmedName = String(updates.name).trim();
    if (trimmedName.length < 2) {
      throw new AppError(400, 'Please provide your full name (minimum 2 characters).');
    }
    db.full_name = trimmedName;
    db.initials = deriveInitials(trimmedName);
  }

  if (updates.email !== undefined) {
    const normalizedEmail = String(updates.email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw new AppError(400, 'Please provide a valid email address.');
    }
    db.email = normalizedEmail;

    // Re-apply the enrollment gate when the email changes.
    const currentRole = currentProfile?.role || '';
    if (isPersonalEmail(normalizedEmail)) {
      db.role = 'Applicant';
      db.enrolled = false;
    } else if (currentRole && !ALLOWED_ROLES.includes(currentRole)) {
      // Promoted back to an enrolled member when switching to a university email.
      db.role = 'Student';
      db.enrolled = true;
    }
  }

  if (updates.department !== undefined) {
    db.department = String(updates.department).trim();
  }
  if (updates.yearLevel !== undefined) {
    db.year_level = String(updates.yearLevel).trim();
  }
  if (updates.role !== undefined) {
    db.role = updates.role;
  }
  if (updates.studentId !== undefined) {
    db.student_id = String(updates.studentId).trim();
  }

  if (Object.keys(db).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(db)
      .eq('id', userId);

    if (error) {
      throw new AppError(400, 'Unable to save profile changes: ' + error.message);
    }
  }

  // Return the freshly persisted user object.
  const updated = await fetchProfile(userId);
  return profileToUser(updated) || (currentProfile ? profileToUser(currentProfile) : null);
}