import assert from 'node:assert';
import { 
  INITIAL_ASSISTANT_MESSAGE, 
  SUGGESTED_QUESTIONS, 
  MOCK_RESPONSES, 
  FALLBACK_RESPONSES, 
  getMockResponse 
} from '../src/data/mockResponses.js';
import { sendChatMessage } from '../src/services/chatService.js';

console.log('--- RUNNING AI CAMPUS ASSISTANT TEST SUITE ---');

// 1. Initial Welcome Message Test
console.log('✓ Checking Initial Welcome Message...');
assert.strictEqual(typeof INITIAL_ASSISTANT_MESSAGE.content, 'string');
assert.ok(INITIAL_ASSISTANT_MESSAGE.content.includes("Hello! I'm your AI Campus Assistant."));
assert.strictEqual(INITIAL_ASSISTANT_MESSAGE.role, 'assistant');

// 2. Suggested Questions Structure Test
console.log('✓ Checking Suggested Questions...');
assert.strictEqual(SUGGESTED_QUESTIONS.length, 6);
const expectedQuestions = [
  'How do I enroll?',
  'What programs are offered?',
  'What are the enrollment requirements?',
  'Where is the registrar?',
  'Where is the library?',
  'What can you help me with?'
];
expectedQuestions.forEach((q, idx) => {
  assert.strictEqual(SUGGESTED_QUESTIONS[idx].text, q);
});

// 3. Test 1: "Hello"
console.log('✓ Test 1: Greeting ("Hello")');
const greetingResp = getMockResponse("Hello");
assert.strictEqual(greetingResp.category, 'greeting');
assert.ok(greetingResp.content.length > 10);

// 4. Test 2: "How do I enroll?"
console.log('✓ Test 2: Enrollment ("How do I enroll?")');
const enrollResp = getMockResponse("How do I enroll?");
assert.strictEqual(enrollResp.category, 'enrollment');
assert.ok(enrollResp.content.toLowerCase().includes("enrollment"));

// 5. Test 3: "What programs are offered?"
console.log('✓ Test 3: Programs ("What programs are offered?")');
const progResp = getMockResponse("What programs are offered?");
assert.strictEqual(progResp.category, 'programs');
assert.ok(progResp.content.includes("Computer") || progResp.content.includes("Engineering"));

// 6. Test 4: "Where is the registrar?"
console.log('✓ Test 4: Registrar ("Where is the registrar?")');
const regResp = getMockResponse("Where is the registrar?");
assert.strictEqual(regResp.category, 'registrar');
assert.ok(regResp.content.includes("Registrar"));

// 7. Test 5: "Where is the library?"
console.log('✓ Test 5: Library ("Where is the library?")');
const libResp = getMockResponse("Where is the library?");
assert.strictEqual(libResp.category, 'library');
assert.ok(libResp.content.includes("Library") || libResp.content.includes("Learning Commons"));

// 8. Test 6: Unknown question (Fallback)
console.log('✓ Test 6: Unknown question fallback');
const unknownResp = getMockResponse("quantum dark matter interstellar warp drive 9999");
assert.strictEqual(unknownResp.category, 'fallback');
assert.ok(unknownResp.content.includes("campus") || unknownResp.content.includes("enrollment"));

// 9. Test Empty / Whitespace handling
console.log('✓ Test Empty / Whitespace input handling');
assert.strictEqual(getMockResponse(""), null);
assert.strictEqual(getMockResponse("   "), null);
assert.strictEqual(getMockResponse(null), null);

// 10. Test Async Service Integration
console.log('✓ Testing async sendChatMessage service...');
async function testService() {
  const start = Date.now();
  const res = await sendChatMessage("How do I enroll?");
  const elapsed = Date.now() - start;
  assert.strictEqual(res.role, 'assistant');
  assert.strictEqual(res.category, 'enrollment');
  assert.ok(elapsed >= 500, `Simulated typing indicator delay should be >= 500ms (was ${elapsed}ms)`);
  console.log(`✓ Async service resolved in ${elapsed}ms with valid mock response.`);
  console.log('\n🎉 ALL 10 UNIT & INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

testService().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
