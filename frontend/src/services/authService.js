/**
 * Campus AI Assistant Authentication Service — THIN API CLIENT
 *
 * All authentication logic & business rules live on the backend
 * (POST /api/auth/*, PATCH /api/profile). This module ONLY:
 *   1. calls those backend endpoints
 *   2. runs quick client-side UX validation (the backend re-enforces it)
 *   3. persists the app's user object (local/session storage)
 *   4. hands the backend-issued tokens to the Supabase anon-key client so it
 *      can persist + auto-refresh the access token (no auth decisions here)
 */

import { supabase } from './supabase.js';

// Demo Accounts (preview-only references for the demo buttons — actual
// credentials and profile data live in Supabase and are managed server-side).
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
    id: 'usr_staff_01',
    name: 'Marcus Thorne',
    email: 'staff@campus.edu',
    studentId: 'STF-2021-104',
    role: 'Staff',
    department: 'Student Affairs & Admissions',
    yearLevel: 'Senior Coordinator',
    avatarColor: 'bg-emerald-600',
    initials: 'MT'
  },
  {
    id: 'usr_admin_01',
    name: 'Dean Victoria Sterling',
    email: 'admin@campus.edu',
    studentId: 'ADM-2018-001',
    role: 'Admin',
    department: 'Office of the University President',
    yearLevel: 'System Administrator',
    avatarColor: 'bg-rose-600',
    initials: 'VS'
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

// Roles allowed to use the AI Campus Assistant.
// Mirror of the backend gate — the backend is authoritative.
export const ALLOWED_ROLES = ['Student', 'Faculty', 'Staff', 'Admin'];
export const ADMIN_ROLES = ['Admin'];
export const STAFF_ROLES = ['Staff', 'Admin'];
// Common personal / non-university email domains -> treated as NOT enrolled.
// NOTE: role/enrollment enforcement happens server-side; this list is only
// used by the informational helpers below.
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'protonmail.com', 'mail.com', 'live.com'
];

export function isPersonalEmail(email) {
  if (typeof email !== 'string') return false;
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return PERSONAL_EMAIL_DOMAINS.includes(domain);
}

/** Enrolled gate used by the UI to choose which view to show. */
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

// ── Session persistence (local/session storage) ─────────────

let inMemoryUser = null;

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
  // Sign out of Supabase locally (scope: 'local' avoids background network request race conditions)
  if (supabase) {
    supabase.auth.signOut({ scope: 'local' }).catch((err) => {
      console.warn('Error signing out of Supabase locally:', err);
    });
  }
}

// ── Backend API access ──────────────────────────────────────

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const API_BASE = env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    throw new Error('Unable to reach the campus server. Please make sure the backend is running and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}

/**
 * Ask the Supabase anon client for the current access token. The anon client
 * persists & auto-refreshes the session (documented browser pattern) — it is
 * never used to mutate data or make auth decisions.
 */
async function getAccessToken() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (err) {
    console.warn('[authService] Could not read session token:', err);
    return null;
  }
}

/**
 * Hand the backend-issued tokens to the anon client so it can persist them and
 * keep the access token fresh (session persistence ONLY).
 */
async function persistSupabaseSession(session) {
  if (!supabase || !session || !session.access_token) return;
  try {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  } catch (err) {
    console.warn('[authService] Could not persist Supabase session:', err);
  }
}

// ── Auth API calls (backend is the source of truth) ─────────

export async function loginUser({ identifier, password, rememberMe = true }) {
  // Quick UX validation — the backend re-validates & enforces.
  if (!identifier || !identifier.trim()) {
    throw new Error('Please enter your University Email or Student/Faculty ID.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const data = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: identifier.trim(), password })
  });

  await persistSupabaseSession(data.session);
  saveUserSession(data.user, rememberMe);
  return data.user;
}

export async function registerUser({ name, email, role = 'Student', department = '', studentId = '', password }) {
  if (!name || name.trim().length < 2) {
    throw new Error('Please provide your full name (minimum 2 characters).');
  }
  if (!email || !isValidEmail(email)) {
    throw new Error('Please provide a valid university email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const data = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      studentId,
      password
    })
  });

  return data;
}

export async function resendVerificationEmail(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid university email address.');
  }

  const data = await request('/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() })
  });

  return { success: true, message: data.message || 'Verification email resent successfully.' };
}

export async function verifyEmailOtp({ email, token }) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid university email address.');
  }
  if (!token || token.trim().length < 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const data = await request('/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      token: token.trim()
    })
  });

  await persistSupabaseSession(data.session);
  saveUserSession(data.user, true);
  return data.user;
}

export async function sendPasswordReset(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid university email address to receive recovery instructions.');
  }

  const data = await request('/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() })
  });

  return { success: true, message: data.message };
}

/**
 * Update the currently logged-in user's editable profile fields.
 * The backend verifies the caller's token and persists to the `profiles`
 * table (ownership enforced server-side), then returns the updated user.
 */
export async function updateUserProfile(updates = {}) {
  const current = getCurrentUser();
  if (!current) {
    throw new Error('No active session. Please sign in to update your profile.');
  }

  // Quick UX validation — the backend re-validates & enforces.
  if (updates.name !== undefined && String(updates.name).trim().length < 2) {
    throw new Error('Please provide your full name (minimum 2 characters).');
  }
  if (updates.email !== undefined && !isValidEmail(String(updates.email).trim())) {
    throw new Error('Please provide a valid email address.');
  }

  const token = await getAccessToken();
  const data = await request('/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(updates)
  });

  // Merge the persisted user into the live session (keeps loginTimestamp etc.).
  const merged = { ...current, ...data.user };
  saveUserSession(merged);
  return merged;
}