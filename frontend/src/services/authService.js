/**
 * Campus AI Assistant Authentication Service
 * Handles user authentication & account persistence via Supabase Auth
 * and the `profiles` table (name, role, department, ...).
 */

import { supabase } from './supabase.js';

// Demo Accounts available for quick testing
export const DEMO_ACCOUNTS = [
  {
    id: 'usr_student_01',
    name: 'Alex Johnson',
    email: 'student@campus.edu',
    studentId: '2024-00842',
    role: 'Student',
    department: 'Computer Science & IT',
    yearLevel: '3rd Year Undergraduate',
    avatarColor: 'bg-blue-600',
    initials: 'AJ'
  },
  {
    id: 'usr_faculty_01',
    name: 'Dr. Eleanor Vance',
    email: 'faculty@campus.edu',
    studentId: 'FAC-2019-441',
    role: 'Faculty',
    department: 'Department of Computer Science',
    yearLevel: 'Associate Professor',
    avatarColor: 'bg-indigo-600',
    initials: 'EV'
  },
  {
    id: 'usr_applicant_01',
    name: 'Jordan Smith',
    email: 'applicant@gmail.com',
    studentId: 'APP-2025-992',
    role: 'Applicant',
    department: 'Prospective Student',
    yearLevel: 'Not Enrolled - Fall 2025 Applicant',
    avatarColor: 'bg-amber-500',
    initials: 'JS',
    enrolled: false
  }
];

const STORAGE_KEY = 'campus_ai_auth_user';
const REMEMBER_KEY = 'campus_ai_auth_remember';

// Roles that are allowed to use the AI Campus Assistant.
// Only ENROLLED campus members (students & faculty/staff) get access.
export const ALLOWED_ROLES = ['Student', 'Faculty', 'Staff'];

// Common personal / non-university email domains -> treated as NOT enrolled.
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'mail.com', 'live.com'
];

export function isPersonalEmail(email) {
  if (typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

/**
 * Enrolled gate: only enrolled students & faculty/staff may use the assistant.
 * Applicants / unenrolled visitors are blocked after login.
 */
export function isEnrolledUser(user) {
  if (!user || !user.role) return false;
  return ALLOWED_ROLES.includes(user.role);
}

let inMemoryUser = null;

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isValidIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return false;
  return identifier.trim().length >= 3;
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return inMemoryUser;
  try {
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
    const raw = remember 
      ? localStorage.getItem(STORAGE_KEY) 
      : (sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY));
    if (raw) {
      const parsed = JSON.parse(raw);
      inMemoryUser = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('Error reading stored user auth:', err);
  }
  return inMemoryUser;
}

export function saveUserSession(user, remember = true) {
  inMemoryUser = user;
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, json);
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      sessionStorage.setItem(STORAGE_KEY, json);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(REMEMBER_KEY, 'false');
    }
  } catch (err) {
    console.warn('Error saving session:', err);
  }
}

export async function loginUser({ identifier, password, rememberMe = true }) {
  if (!identifier || !identifier.trim()) {
    throw new Error('Please enter your University Email or Student/Faculty ID.');
  }

  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const email = identifier.trim().toLowerCase();

  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  // Authenticate against Supabase Auth.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (/invalid login credentials/i.test(error.message)) {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
    }
    if (/email not confirmed/i.test(error.message)) {
      throw new Error('Email not verified yet. Please register again and enter the 6-digit code to confirm your account.');
    }
    throw new Error(error.message || 'Unable to sign in. Please try again.');
  }

  // Load the campus profile stored in the `profiles` table.
  const profile = await fetchProfile(data.user.id);
  const user = buildUserFromAuth(data.user, profile);
  user.loginTimestamp = new Date().toISOString();

  saveUserSession(user, rememberMe);
  return user;
}

export async function registerUser({ name, email, role = 'Student', department = '', studentId = '', password, rememberMe = true }) {
  if (!name || name.trim().length < 2) {
    throw new Error('Please provide your full name (minimum 2 characters).');
  }

  if (!email || !isValidEmail(email)) {
    throw new Error('Please provide a valid university email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const trimmedName = name.trim();
  const normEmail = email.trim().toLowerCase();
  const initials = deriveInitials(trimmedName) || 'ST';
  const isPersonalDomain = isPersonalEmail(normEmail);
  const effectiveRole = isPersonalDomain ? 'Applicant' : role;
  const avatarColor = effectiveRole === 'Faculty' ? 'bg-indigo-600'
    : isPersonalDomain ? 'bg-amber-500' : 'bg-blue-600';

  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  // Create the account in Supabase Auth. The `handle_new_user` trigger
  // automatically inserts a matching row into the `profiles` table.
  const { data, error } = await supabase.auth.signUp({
    email: normEmail,
    password,
    options: {
      data: {
        full_name: trimmedName,
        student_id: studentId || '',
        role: effectiveRole,
        department: department.trim() || '',
        avatar_color: avatarColor,
        initials
      }
    }
  });

  if (error) {
    if (/already registered|already been registered/i.test(error.message)) {
      throw new Error('This email is already registered. Please sign in instead.');
    }
    throw new Error(error.message || 'Unable to create your account. Please try again.');
  }

  // Supabase sends a confirmation email by default. When that is enabled,
  // there is NO active session yet — the user must verify first.
  if (!data.session) {
    return {
      needsEmailVerification: true,
      email: normEmail,
      message: `Account created! A 6-digit verification code was sent to ${normEmail}. Enter it below to confirm it's really you.`
    };
  }

  // Email confirmation disabled → user is signed in right away.
  const profile = await fetchProfile(data.user.id);
  const newUser = buildUserFromAuth(data.user, profile);
  newUser.loginTimestamp = new Date().toISOString();

  saveUserSession(newUser, rememberMe);
  return newUser;
}

/**
 * Confirm a freshly registered account with the 6-digit verification code
 * that Supabase emailed during sign-up (type 'signup' OTP). On success the
 * account is confirmed, a session is created, and the full user is returned.
 */
export async function verifySignupOtp({ email, token, rememberMe = true }) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please provide the email address you registered.');
  }

  const code = String(token || '').replace(/\D/g, '');
  if (code.length !== 6) {
    throw new Error('Please enter the 6-digit verification code from your email.');
  }

  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: String(email).trim().toLowerCase(),
    token: code,
    type: 'signup'
  });

  if (error) {
    if (/expired/i.test(error.message)) {
      throw new Error('This code has expired. Please press "Resend code" to get a new one.');
    }
    if (/invalid|incorrect|not found|\botp\b/i.test(error.message)) {
      throw new Error('The code you entered is incorrect. Please check your email and try again.');
    }
    throw new Error(error.message || 'Unable to verify your code. Please try again.');
  }

  if (!data.user) {
    throw new Error('We could not verify the code. Please try again.');
  }

  const profile = await fetchProfile(data.user.id);
  const user = buildUserFromAuth(data.user, profile);
  user.loginTimestamp = new Date().toISOString();

  saveUserSession(user, rememberMe);
  return user;
}

export async function sendPasswordReset(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid university email address to receive recovery instructions.');
  }

  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    String(email).trim().toLowerCase(),
    { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
  );

  if (error) {
    throw new Error(error.message || 'Unable to send password reset instructions. Please try again.');
  }

  return {
    success: true,
    message: `Password reset instructions have been sent to ${email.trim()}. Please check your university inbox.`
  };
}

/**
 * Recompute the user's display initials from a full name.
 * Mirrors the logic used at login/registration.
 */
function deriveInitials(name) {
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
/**
 * Map a `profiles` row into the shape used across the app.
 */
function profileToUser(profile) {
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

/**
 * Combine a Supabase auth user with its fetched profile row.
 */
function buildUserFromAuth(authUser, profile) {
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

/**
 * Fetch the profile row for a given Supabase user id.
 */
async function fetchProfile(userId) {
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

/**
 * Update the currently logged-in user's editable profile fields and persist
 * the changes to the Supabase `profiles` table. Returns the updated user object.
 *
 * @param {Object} updates   Partial fields to change: { name, email, department, yearLevel, ... }
 * @returns {Promise<Object>} The merged, persisted user object.
 */
export async function updateUserProfile(updates = {}) {
  const current = getCurrentUser();
  if (!current) {
    throw new Error('No active session. Please sign in to update your profile.');
  }

  // Translate app-friendly field names into `profiles` table column names.
  const db = {};

  // Normalize & validate name
  if (updates.name !== undefined) {
    const trimmedName = String(updates.name).trim();
    if (trimmedName.length < 2) {
      throw new Error('Please provide your full name (minimum 2 characters).');
    }
    db.full_name = trimmedName;
    db.initials = deriveInitials(trimmedName);
  }

  // Normalize & validate email
  if (updates.email !== undefined) {
    const normalizedEmail = String(updates.email).trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Please provide a valid email address.');
    }
    db.email = normalizedEmail;

    // Re-apply the enrollment gate when the email changes.
    if (isPersonalEmail(normalizedEmail)) {
      db.role = 'Applicant';
      db.enrolled = false;
    } else if (!ALLOWED_ROLES.includes(current.role)) {
      // Promoted back to an enrolled member when switching to university email.
      db.role = 'Student';
      db.enrolled = true;
    }
  }

  // Normalize optional free-text fields
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

  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your .env.local file.');
  }

  const { error } = await supabase
    .from('profiles')
    .update(db)
    .eq('id', current.id);

  if (error) {
    throw new Error('Unable to save profile changes: ' + error.message);
  }

  // Mirror changes into the locally cached user object.
  const updated = { ...current, ...updates };
  if (db.full_name !== undefined) updated.name = db.full_name;
  if (db.initials !== undefined) updated.initials = db.initials;
  if (db.email !== undefined) updated.email = db.email;
  if (db.year_level !== undefined) updated.yearLevel = db.year_level;
  if (db.enrolled !== undefined) updated.enrolled = db.enrolled;
  if (db.role !== undefined) updated.role = db.role;

  saveUserSession(updated);
  return updated;
}

export function clearUserSession() {
  inMemoryUser = null;
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Error clearing session:', err);
  }
  // Sign out of Supabase (fire-and-forget; Supabase clears its own tokens).
  if (supabase) {
    supabase.auth.signOut().catch((err) => {
      console.warn('Error signing out of Supabase:', err);
    });
  }
}
