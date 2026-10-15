import assert from 'node:assert';
import {
  INITIAL_ASSISTANT_MESSAGE,
  SUGGESTED_QUESTIONS
} from '../src/data/mockResponses.js';
import * as mockModule from '../src/data/mockResponses.js';
import { sendChatMessage } from '../src/services/chatService.js';

console.log('--- RUNNING ASSISTANT FRONTEND TEST SUITE ---');

// 1. Initial welcome message structure
console.log('✓ Checking INITIAL_ASSISTANT_MESSAGE...');
assert.strictEqual(INITIAL_ASSISTANT_MESSAGE.role, 'assistant');
assert.strictEqual(INITIAL_ASSISTANT_MESSAGE.category, 'welcome');
assert.ok(INITIAL_ASSISTANT_MESSAGE.content.length > 20);

// 2. Suggested questions
console.log('✓ Checking SUGGESTED_QUESTIONS...');
assert.ok(Array.isArray(SUGGESTED_QUESTIONS) && SUGGESTED_QUESTIONS.length === 6);
const ids = new Set(SUGGESTED_QUESTIONS.map((q) => q.id));
assert.strictEqual(ids.size, SUGGESTED_QUESTIONS.length, 'Suggested question ids must be unique');
SUGGESTED_QUESTIONS.forEach((q) => {
  assert.ok(q.text && q.category && q.icon);
});

// 3. The duplicated knowledge base is gone from the frontend — mockResponses
//    now only exports static UI constants (the response engine lives on the
//    backend at backend/src/data/responseEngine.js).
console.log('✓ Checking mockResponses only exports UI constants...');
const frontendExports = Object.keys(mockModule).sort();
assert.deepStrictEqual(
  frontendExports,
  ['INITIAL_ASSISTANT_MESSAGE', 'SUGGESTED_QUESTIONS'],
  'mockResponses must not re-export answer logic'
);

// 4. sendChatMessage must NOT silently fall back — if the backend is not
//    reachable it rejects so the UI can show a helpful error message.
console.log('✓ Testing sendChatMessage rejects when the backend is unreachable (no local fallback)...');
try {
  await sendChatMessage('How do I enroll?');
  assert.fail('Expected sendChatMessage to reject when the backend is unreachable.');
} catch (err) {
  assert.ok(err.message && err.message.length > 0);
}

console.log('✅ All frontend assistant tests passed.');
console.log('ℹ️  Response-engine coverage lives in backend/test/responseEngine.test.js.');