import assert from 'node:assert';
import {
  isValidEmail,
  isValidIdentifier,
  loginUser,
  registerUser,
  sendPasswordReset,
  getCurrentUser,
  saveUserSession,
  clearUserSession,
  isEnrolledUser,
  isPersonalEmail,
  ALLOWED_ROLES,
  updateUserProfile
} from '../src/services/authService.js';

console.log('--- RUNNING AUTH SERVICE TEST SUITE (Supabase build) ---');

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
assert.strictEqual(isEnrolledUser({ role: 'Student' }), true);   // Student
assert.strictEqual(isEnrolledUser({ role: 'Faculty' }), true);   // Faculty
assert.strictEqual(isEnrolledUser({ role: 'Staff' }), true);   // Staff
assert.strictEqual(isEnrolledUser({ role: 'Admin' }), true);   // Admin
assert.strictEqual(isEnrolledUser({ role: 'Applicant' }), false);  // Applicant

// 6. Login validation happens before any Supabase call
console.log('✓ Test: Missing login credentials throws');
let threwMissing = false;
try {
  await loginUser({ identifier: '', password: '' });
} catch (err) {
  threwMissing = true;
  assert.ok(err.message.length > 0);
}
assert.strictEqual(threwMissing, true);

// 7. Registration validation happens before any Supabase call
console.log('✓ Test: Invalid registration (bad email) throws');
let threwBadEmail = false;
try {
  await registerUser({ name: 'Test User', email: 'bad-email', password: 'secure123' });
} catch (err) {
  threwBadEmail = true;
  assert.ok(err.message.length > 0);
}
assert.strictEqual(threwBadEmail, true);

console.log('✓ Test: Invalid registration (short name) throws');
let threwShortName = false;
try {
  await registerUser({ name: 'A', email: 'test@campus.edu', password: 'secure123' });
} catch (err) {
  threwShortName = true;
}
assert.strictEqual(threwShortName, true);

console.log('✓ Test: Invalid registration (short password) throws');
let threwShortPw = false;
try {
  await registerUser({ name: 'Test User', email: 'test@campus.edu', password: '123' });
} catch (err) {
  threwShortPw = true;
}
assert.strictEqual(threwShortPw, true);

// 8. Password reset validation
console.log('✓ Test: Invalid reset email throws');
let threwReset = false;
try {
  await sendPasswordReset('invalid');
} catch (err) {
  threwReset = true;
  assert.ok(err.message.length > 0);
}
assert.strictEqual(threwReset, true);

// 9. updateUserProfile requires an active session
console.log('✓ Test: updateUserProfile without session throws');
let threwNoSession = false;
try {
  await updateUserProfile({ name: 'Maria Clara Santos' });
} catch (err) {
  threwNoSession = true;
  assert.ok(err.message.includes('No active session'));
}
assert.strictEqual(threwNoSession, true);

// 11. Session round-trip (in-memory when no browser storage is available)
console.log('✓ Test: saveUserSession / getCurrentUser / clearUserSession');
assert.strictEqual(getCurrentUser(), null);
const mockUser = { id: 'usr_student_01', name: 'Alex Johnson', email: 'student@campus.edu', role: 'Student', loginTimestamp: new Date().toISOString() };
saveUserSession(mockUser, false);
assert.strictEqual(getCurrentUser().email, 'student@campus.edu');
clearUserSession();
assert.strictEqual(getCurrentUser(), null);

console.log('🎉 ALL 17 AUTH SERVICE UNIT TESTS PASSED SUCCESSFULLY!');
console.log('');
console.log('ℹ️  Live Supabase flows (real signup/login/profile) are tested manually in the browser.');
