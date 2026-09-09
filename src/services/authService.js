/**
 * Campus AI Assistant Authentication Service
 * Handles user authentication, session storage, demo accounts, and validation.
 */

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
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (!identifier || !identifier.trim()) {
    throw new Error('Please enter your University Email or Student/Faculty ID.');
  }

  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters long.');
  }

  const normalized = identifier.trim().toLowerCase();

  // 1. Check built-in demo accounts
  const matchedDemo = DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalized || 
             acc.studentId.toLowerCase() === normalized
  );

  if (matchedDemo) {
    const userSession = {
      ...matchedDemo,
      loginTimestamp: new Date().toISOString()
    };
    saveUserSession(userSession, rememberMe);
    return userSession;
  }

  // 2. Allow custom user login if valid format
  const isEmail = isValidEmail(normalized);
  const isPersonalDomain = isEmail && isPersonalEmail(normalized);
  const derivedName = normalized.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const initials = derivedName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  // Enrollment rule: personal / non-university emails are treated as NOT enrolled.
  // Only university emails or campus IDs map to an enrolled Student/Faculty member.
  const derivedRole = isPersonalDomain
    ? 'Applicant'
    : (normalized.includes('fac') || normalized.includes('prof') ? 'Faculty' : 'Student');

  const customUser = {
    id: `usr_${Date.now().toString(36)}`,
    name: derivedName || 'Campus Member',
    email: isEmail ? normalized : `${normalized}@campus.edu`,
    studentId: isEmail ? `ID-${Math.floor(100000 + Math.random() * 900000)}` : identifier.toUpperCase(),
    role: derivedRole,
    department: isPersonalDomain ? 'Unenrolled / Prospective Member' : 'University Campus Community',
    yearLevel: isPersonalDomain ? 'Not Enrolled' : 'Active Member',
    avatarColor: isPersonalDomain ? 'bg-amber-500' : 'bg-blue-600',
    initials: initials,
    loginTimestamp: new Date().toISOString()
  };

  saveUserSession(customUser, rememberMe);
  return customUser;
}

export async function registerUser({ name, email, role = 'Student', department = '', password, rememberMe = true }) {
  await new Promise((resolve) => setTimeout(resolve, 400));

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
  const initials = trimmedName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'ST';

  const normalizedRegEmail = email.trim().toLowerCase();
  const isPersonalDomain = isPersonalEmail(normalizedRegEmail);
  // Enrollment rule mirrors login: registration with a personal / non-university
  // email always results in an unenrolled (Applicant) account with no access.
  const effectiveRole = isPersonalDomain ? 'Applicant' : (role || 'Student');

  const newUser = {
    id: `usr_reg_${Date.now()}`,
    name: trimmedName,
    email: normalizedRegEmail,
    studentId: `${effectiveRole.toUpperCase().substring(0, 3)}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    role: effectiveRole,
    department: department.trim() || (isPersonalDomain ? 'Unenrolled / Prospective Member' : 'General Studies & Academic Hub'),
    yearLevel: effectiveRole === 'Faculty' ? 'Academic Staff' : isPersonalDomain ? 'Not Enrolled' : 'Enrolled Student',
    avatarColor: effectiveRole === 'Faculty' ? 'bg-indigo-600' : isPersonalDomain ? 'bg-amber-500' : 'bg-blue-600',
    initials: initials,
    loginTimestamp: new Date().toISOString()
  };

  saveUserSession(newUser, rememberMe);
  return newUser;
}

export async function sendPasswordReset(email) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid university email address to receive recovery instructions.');
  }

  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${email.trim()}. Please check your university inbox.`
  };
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
}
