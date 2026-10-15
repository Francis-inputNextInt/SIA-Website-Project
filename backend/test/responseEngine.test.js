import assert from 'node:assert';
import { createServer } from 'node:http';
import {
  MOCK_RESPONSES,
  FALLBACK_RESPONSES,
  getMockResponse
} from '../src/data/responseEngine.js';

console.log('--- RUNNING BACKEND RESPONSE ENGINE TEST SUITE ---');

// 1. MockResponses structure
console.log('✓ Checking MOCK_RESPONSES structure...');
assert.ok(Array.isArray(MOCK_RESPONSES) && MOCK_RESPONSES.length > 0);
MOCK_RESPONSES.forEach((item) => {
  assert.ok(item.category && typeof item.category === 'string');
  assert.ok(Array.isArray(item.keywords) && item.keywords.length > 0);
  assert.ok(Array.isArray(item.responses) && item.responses.length > 0);
});

// 2. Fallback responses
console.log('✓ Checking FALLBACK_RESPONSES...');
assert.ok(Array.isArray(FALLBACK_RESPONSES) && FALLBACK_RESPONSES.length > 0);

// 3. Greeting
console.log('✓ Test: Greeting ("Hello")');
const greeting = getMockResponse("Hello");
assert.strictEqual(greeting.category, 'greeting');
assert.ok(greeting.content.length > 10);

// 4. Enrollment
console.log('✓ Test: Enrollment ("How do I enroll?")');
const enroll = getMockResponse("How do I enroll?");
assert.strictEqual(enroll.category, 'enrollment');
assert.ok(enroll.content.toLowerCase().includes("enrollment"));

// 5. Programs
console.log('✓ Test: Programs ("What programs are offered?")');
const prog = getMockResponse("What programs are offered?");
assert.strictEqual(prog.category, 'programs');
assert.ok(prog.content.includes("Computer") || prog.content.includes("Engineering"));

// 6. Registrar
console.log('✓ Test: Registrar ("Where is the registrar?")');
const reg = getMockResponse("Where is the registrar?");
assert.strictEqual(reg.category, 'registrar');
assert.ok(reg.content.includes("Registrar"));

// 7. Library
console.log('✓ Test: Library ("Where is the library?")');
const lib = getMockResponse("Where is the library?");
assert.strictEqual(lib.category, 'library');
assert.ok(lib.content.includes("Library") || lib.content.includes("Learning Commons"));

// 8. Unknown → fallback
console.log('✓ Test: Fallback ("quantum dark matter 9999")');
const unknown = getMockResponse("quantum dark matter interstellar warp drive 9999");
assert.strictEqual(unknown.category, 'fallback');
assert.ok(unknown.content.includes("campus") || unknown.content.includes("enrollment"));

// 9. Empty / whitespace / null
console.log('✓ Test: Empty / whitespace / null input');
assert.strictEqual(getMockResponse(""), null);
assert.strictEqual(getMockResponse("   "), null);
assert.strictEqual(getMockResponse(null), null);

console.log('✅ All response engine tests passed.\n');

// ── HTTP Smoke Test ────────────────────────────────────────
console.log('--- RUNNING HTTP SMOKE TEST (POST /api/chat) ---');

// Import Express app (needs dotenv loaded first for completeness)
import 'dotenv/config';
import { app } from '../src/app.js';

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  try {
    // Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.ok, true);
    const health = await healthRes.json();
    assert.strictEqual(health.status, 'ok');
    console.log('✓ GET /api/health → 200');

    // Chat — valid message
    const chatRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });
    assert.strictEqual(chatRes.ok, true);
    const chat = await chatRes.json();
    assert.strictEqual(chat.role, 'assistant');
    assert.ok(chat.content.length > 0);
    assert.strictEqual(chat.category, 'greeting');
    console.log('✓ POST /api/chat (Hello) → 200, category: greeting');

    // Chat — empty message → 400
    const badRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    assert.strictEqual(badRes.status, 400);
    console.log('✓ POST /api/chat (empty) → 400');

    // Chat — no body → 400
    const noBodyRes = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(noBodyRes.status, 400);
    console.log('✓ POST /api/chat (no message) → 400');

    // 404 for unknown route
    const notFoundRes = await fetch(`${baseUrl}/api/nonexistent`);
    assert.strictEqual(notFoundRes.status, 404);
    console.log('✓ GET /api/nonexistent → 404');

    console.log('\n🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});