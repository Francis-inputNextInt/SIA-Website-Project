import assert from 'node:assert';
import {
  DEMO_ACCOUNTS,
  isValidEmail,
  isValidIdentifier,
  loginUser,
  registerUser,
  sendPasswordReset,
  getCurrentUser,
  clearUserSession,
  isEnrolledUser,
  isPersonalEmail,
  ALLOWED_ROLES
} from '../src/services/authService.js';

console.log('--- RUNNING AUTH SERVICE TEST SUITE ---');

// 1. Demo accounts structure
console.log('✓ Checking Demo Accounts...');
assert.ok(Array.isArray(DEMO_ACCOUNTS) && DEMO_ACCOUNTS.length === 3);
DEMO_ACCOUNTS.forEach((acc) => {
  assert.ok(acc.name && acc.email && acc.studentId && acc.role && acc.initials);
});

// 2. Email validation
console.log('✓ Checking isValidEmail...');
assert.strictEqual(isValidEmail('student@campus.edu'), true);
assert.strictEqual(isValidEmail('STUDENT@CAMPUS.EDU'), true);
assert.strictEqual(isValidEmail('not-an-email'), false);
assert.strictEqual(isValidEmail(''), false);
assert.strictEqual(isValidEmail('user@'), false);

// 3. Identifier validation
console.log('✓ Checking isValidIdentifier...');
assert.strictEqual(isValidIdentifier('2024-00842'), true);
assert.strictEqual(isValidIdentifier('abc'), true);
assert.strictEqual(isValidIdentifier('ab'), false);
assert.strictEqual(isValidIdentifier(''), false);

// 4. Valid login with demo account
console.log('✓ Test: Login with demo student account');
const student = await loginUser({ identifier: 'student@campus.edu', password: 'password123', rememberMe: false });
assert.strictEqual(student.role, 'Student');
assert.strictEqual(student.email, 'student@campus.edu');

// 5. Login by campus ID
console.log('✓ Test: Login using campus ID');
const byId = await loginUser({ identifier: 'FAC-2019-441', password: 'password123', rememberMe: false });
assert.strictEqual(byId.name, 'Dr. Eleanor Vance');

// 6. Login with missing credentials should throw error
console.log('✓ Test: Invalid login throws error');
let threwMissing = false;
try {
  await loginUser({ identifier: '', password: '' });
} catch (err) {
  threwMissing = true;
  assert.ok(err.message.length > 0);
}
assert.strictEqual(threwMissing, true);

// 7. Register a new user
console.log('✓ Test: Register new student');
const newStudent = await registerUser({
  name: 'Maria Clara Santos',
  email: 'maria.santos@campus.edu',
  password: 'securepass123',
  role: 'Student',
  rememberMe: false
});
assert.strictEqual(newStudent.name, 'Maria Clara Santos');
assert.strictEqual(newStudent.role, 'Student');
assert.ok(newStudent.studentId.startsWith('STU-'));
assert.strictEqual(newStudent.initials, 'MC');

// 8. Register with invalid email should throw
console.log('✓ Test: Invalid registration throws error');
let threwBadEmail = false;
try {
  await registerUser({ name: 'Test User', email: 'bad-email', password: 'secure123' });
} catch (err) {
  threwBadEmail = true;
  assert.ok(err.message.length > 0);
}
assert.strictEqual(threwBadEmail, true);

// 9. Password reset flow
console.log('✓ Test: Send password reset');
const reset = await sendPasswordReset('maria.santos@campus.edu');
assert.strictEqual(reset.success, true);
assert.ok(reset.message.includes('maria.santos@campus.edu'));

// 10. Invalid reset email throws error
console.log('✓ Test: Invalid reset email throws error');
let threwReset = false;
try {
  await sendPasswordReset('invalid');
} catch (err) {
  threwReset = true;
}
assert.strictEqual(threwReset, true);

// 11. Session persistence helper (no window in Node, must not crash)
console.log('✓ Test: getCurrentUser / clearUserSession safe in Node');
clearUserSession();
assert.strictEqual(getCurrentUser(), null);

// 12. Custom user login (any valid identifier works for testing)
console.log('✓ Test: Custom email login');
const custom = await loginUser({ identifier: 'custom.user@gmail.com', password: 'pass1234', rememberMe: false });
assert.ok(custom.email.includes('gmail.com'));
assert.ok(custom.name.length > 0);
assert.ok(custom.initials.length >= 1);
// Personal email => treated as unenrolled Applicant (no assistant access)
assert.strictEqual(custom.role, 'Applicant');
assert.strictEqual(isEnrolledUser(custom), false);

// 13. Enrollment gate: ALLOWED_ROLES / isEnrolledUser
console.log('✓ Test: Only enrolled students & faculty/staff may use the assistant');
assert.deepStrictEqual(ALLOWED_ROLES, ['Student', 'Faculty', 'Staff']);
assert.strictEqual(isEnrolledUser({ role: 'Student' }), true);
assert.strictEqual(isEnrolledUser({ role: 'Faculty' }), true);
assert.strictEqual(isEnrolledUser({ role: 'Staff' }), true);
assert.strictEqual(isEnrolledUser({ role: 'Applicant' }), false);
assert.strictEqual(isEnrolledUser(null), false);
assert.strictEqual(isEnrolledUser({}), false);

// 14. Demo Applicant account is blocked from the assistant
console.log('✓ Test: Demo Applicant login is blocked (unenrolled)');
const applicant = await loginUser({ identifier: 'applicant@gmail.com', password: 'password123', rememberMe: false });
assert.strictEqual(applicant.role, 'Applicant');
assert.strictEqual(applicant.enrolled, false);
assert.strictEqual(isEnrolledUser(applicant), false);

// 15. University-email custom login IS enrolled and can use the assistant
console.log('✓ Test: University-email login is enrolled');
const insider = await loginUser({ identifier: 'juan.delacruz@campus.edu', password: 'pass1234', rememberMe: false });
assert.strictEqual(insider.role, 'Student');
assert.strictEqual(isEnrolledUser(insider), true);

// 16. Registration with personal email is forced to unenrolled status
console.log('✓ Test: Personal-email registration is marked unenrolled');
const outsiderReg = await registerUser({
  name: 'Guest Visitor',
  email: 'guest@yahoo.com',
  password: 'secure123',
  role: 'Student',
  rememberMe: false
});
assert.strictEqual(outsiderReg.role, 'Applicant');
assert.strictEqual(outsiderReg.yearLevel, 'Not Enrolled');
assert.strictEqual(isEnrolledUser(outsiderReg), false);

// 17. Registration with university email using Student role stays enrolled
console.log('✓ Test: University-email registration stays enrolled');
const insiderReg = await registerUser({
  name: 'Ana Reyes',
  email: 'ana.reyes@campus.edu',
  password: 'secure123',
  role: 'Student',
  rememberMe: false
});
assert.strictEqual(insiderReg.role, 'Student');
assert.strictEqual(isEnrolledUser(insiderReg), true);

// 18. isPersonalEmail helper
console.log('✓ Test: isPersonalEmail detection');
assert.strictEqual(isPersonalEmail('user@gmail.com'), true);
assert.strictEqual(isPersonalEmail('user@campus.edu'), false);

console.log('\n🎉 ALL 18 AUTH SERVICE TESTS PASSED SUCCESSFULLY!');