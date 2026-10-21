import assert from 'node:assert';
import 'dotenv/config';
import { app } from '../src/app.js';

// ── Pure helpers (server-side business rules) ───────────────
import {
  isValidEmail,
  isValidIdentifier,
  isPersonalEmail,
  isEnrolledUser,
  ALLOWED_ROLES,
  deriveInitials,
  profileToUser,
  buildUserFromAuth
} from '../src/services/authService.js';

console.log('--- RUNNING BACKEND AUTH SERVICE TEST SUITE ---');

// 1. Email validation
console.log('✓ Checking isValidEmail...');
assert.strictEqual(isValidEmail('student@campus.edu'), true);
assert.strictEqual(isValidEmail('STUDENT@CAMPUS.EDU'), true);
assert.strictEqual(isValidEmail('not-an-email'), false);
assert.strictEqual(isValidEmail(''), false);
assert.strictEqual(isValidEmail('user@'), false);

// 2. Identifier validation
console.log('✓ Checking isValidIdentifier...');
assert.strictEqual(isValidIdentifier('2024-00842'), true);
assert.strictEqual(isValidIdentifier('abc'), true);
assert.strictEqual(isValidIdentifier('ab'), false);
assert.strictEqual(isValidIdentifier(''), false);

// 3. Personal-email detection
console.log('✓ Checking isPersonalEmail...');
assert.strictEqual(isPersonalEmail('user@gmail.com'), true);
assert.strictEqual(isPersonalEmail('user@campus.edu'), false);

// 4. Enrolled gate
console.log('✓ Checking isEnrolledUser / ALLOWED_ROLES...');
assert.deepStrictEqual(ALLOWED_ROLES, ['Student', 'Faculty', 'Staff', 'Admin']);
assert.strictEqual(isEnrolledUser({ role: 'Student' }), true);
assert.strictEqual(isEnrolledUser({ role: 'Faculty' }), true);
assert.strictEqual(isEnrolledUser({ role: 'Applicant' }), false);
assert.strictEqual(isEnrolledUser(null), false);

// 5. Initials derivation
console.log('✓ Checking deriveInitials...');
assert.strictEqual(deriveInitials('Maria Clara Santos'), 'MC');
assert.strictEqual(deriveInitials('Dr. Eleanor Vance'), 'DE');
assert.strictEqual(deriveInitials('  '), '');

// 6. profileToUser mapping
console.log('✓ Checking profileToUser mapping...');
const profile = {
  id: 'u1',
  full_name: 'Jane D.',
  email: 'jane@campus.edu',
  student_id: '2024-001',
  role: 'Student',
  department: 'Computer Science & IT',
  year_level: '3rd Year Undergraduate',
  avatar_color: 'bg-blue-600',
  initials: 'JD',
  enrolled: true
};
const mapped = profileToUser(profile);
assert.strictEqual(mapped.id, 'u1');
assert.strictEqual(mapped.name, 'Jane D.');
assert.strictEqual(mapped.studentId, '2024-001');
assert.strictEqual(mapped.role, 'Student');
assert.strictEqual(mapped.department, 'Computer Science & IT');
assert.strictEqual(mapped.yearLevel, '3rd Year Undergraduate');
assert.strictEqual(mapped.avatarColor, 'bg-blue-600');
assert.strictEqual(mapped.initials, 'JD');
assert.strictEqual(mapped.enrolled, true);
assert.strictEqual(profileToUser(null), null);

// 7. buildUserFromAuth fallback (metadata only, no profile row)
console.log('✓ Checking buildUserFromAuth...');
const authUser = {
  id: 'u9',
  email: 'user@gmail.com',
  user_metadata: { full_name: 'Jane Doe', role: 'Student' }
};
const userFromMeta = buildUserFromAuth(authUser, null);
assert.strictEqual(userFromMeta.name, 'Jane Doe');
assert.strictEqual(userFromMeta.enrolled, false); // gmail → not enrolled fallback
const userWithProfile = buildUserFromAuth(authUser, profile);
assert.strictEqual(userWithProfile.role, 'Student');
assert.strictEqual(userWithProfile.studentId, '2024-001');

console.log('✅ All helper tests passed.\n');

// ── HTTP validation smoke tests (no live Supabase needed) ──
console.log('--- RUNNING AUTH HTTP SMOKE TESTS ---');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  const expectStatus = async (label, path, method, body, status) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    assert.strictEqual(res.status, status, `${label} → expected ${status}, got ${res.status}`);
    const payload = await res.json().catch(() => ({}));
    assert.ok(payload.error, `${label} → expected an error message in the body`);
    console.log(`✓ ${label} → ${status}`);
  };

  try {
    await expectStatus('POST /api/auth/login (empty identifier)', '/api/auth/login', 'POST', { identifier: '', password: '' }, 400);
    await expectStatus('POST /api/auth/login (short password)', '/api/auth/login', 'POST', { identifier: 'student@campus.edu', password: '123' }, 400);
    await expectStatus('POST /api/auth/register (bad email)', '/api/auth/register', 'POST', { name: 'Test User', email: 'bad-email', password: 'secure123' }, 400);
    await expectStatus('POST /api/auth/register (short name)', '/api/auth/register', 'POST', { name: 'A', email: 'test@campus.edu', password: 'secure123' }, 400);
    await expectStatus('POST /api/auth/register (short password)', '/api/auth/register', 'POST', { name: 'Test User', email: 'test@campus.edu', password: '123' }, 400);
    await expectStatus('POST /api/auth/forgot-password (bad email)', '/api/auth/forgot-password', 'POST', { email: 'bad' }, 400);
    await expectStatus('POST /api/auth/resend-verification (bad email)', '/api/auth/resend-verification', 'POST', { email: 'bad' }, 400);
    await expectStatus('GET /api/auth/me (no token)', '/api/auth/me', 'GET', undefined, 401);
    await expectStatus('PATCH /api/profile (no token)', '/api/profile', 'PATCH', { name: 'Test' }, 401);

    console.log('\n🎉 ALL BACKEND AUTH TESTS PASSED SUCCESSFULLY!');
    console.log('ℹ️  Live flows (real signup/login/OTP/profile) are tested in the browser against the running servers.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});