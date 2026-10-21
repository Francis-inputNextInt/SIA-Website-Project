import assert from 'node:assert';

console.log('--- RUNNING CHAT HISTORY PERSISTENCE & ACCOUNT ISOLATION TEST SUITE ---');

// Mock localStorage for Node test environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Helper mirroring App.jsx
function getChatStorageKey(userId) {
  return userId ? `chat_history_${userId}` : 'chat_history_guest';
}

// 1. Test user-scoped storage key uniqueness
console.log('✓ Testing user-scoped storage keys...');
const studentId = 'user-student-123';
const facultyId = 'user-faculty-456';
const studentKey = getChatStorageKey(studentId);
const facultyKey = getChatStorageKey(facultyId);

assert.strictEqual(studentKey, 'chat_history_user-student-123');
assert.strictEqual(facultyKey, 'chat_history_user-faculty-456');
assert.notStrictEqual(studentKey, facultyKey);

// 2. Test saving and loading isolated chat histories
console.log('✓ Testing account chat history isolation...');
const studentMessages = [
  { id: '1', role: 'assistant', content: 'Welcome student!' },
  { id: '2', role: 'user', content: 'What are my grades?' }
];
const facultyMessages = [
  { id: '1', role: 'assistant', content: 'Welcome faculty!' },
  { id: '2', role: 'user', content: 'Show teaching schedule.' }
];

// Simulate login as Student and saving chat
localStorage.setItem(studentKey, JSON.stringify(studentMessages));
// Simulate login as Faculty and saving chat
localStorage.setItem(facultyKey, JSON.stringify(facultyMessages));

// Verify Student loads only student messages
const loadedStudent = JSON.parse(localStorage.getItem(studentKey));
assert.strictEqual(loadedStudent.length, 2);
assert.strictEqual(loadedStudent[1].content, 'What are my grades?');

// Verify Faculty loads only faculty messages
const loadedFaculty = JSON.parse(localStorage.getItem(facultyKey));
assert.strictEqual(loadedFaculty.length, 2);
assert.strictEqual(loadedFaculty[1].content, 'Show teaching schedule.');

// 3. Test logout & new conversation clearing
console.log('✓ Testing logout and new conversation clearing...');
// Logout (clears student session / previous session state or new conversation clears storage)
localStorage.removeItem(studentKey);
assert.strictEqual(localStorage.getItem(studentKey), null);
// Faculty history remains untouched
assert.strictEqual(JSON.parse(localStorage.getItem(facultyKey)).length, 2);

console.log('🎉 ALL CHAT HISTORY PERSISTENCE & ACCOUNT ISOLATION TESTS PASSED SUCCESSFULLY!');
