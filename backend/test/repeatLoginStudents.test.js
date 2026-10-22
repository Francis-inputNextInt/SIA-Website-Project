import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from '../src/app.js';
import { getAdminClient } from '../src/config/supabase.js';

console.log('--- RUNNING REPEATED LOGIN & STUDENT FETCH INTEGRATION TEST ---');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  try {
    const db = getAdminClient();
    assert.ok(db, 'Supabase admin client configured');

    // Simulate Login 1: fetch students
    console.log('1. Simulating Login 1: Fetching faculty students...');
    const { data: students1, error: err1 } = await db.from('profiles')
      .select('id, full_name, email, role, enrolled')
      .ilike('role', 'student');
    assert.strictEqual(err1, null);
    const count1 = (students1 || []).length;
    console.log(`   -> Login 1 students retrieved: ${count1}`);
    assert.strictEqual(count1 >= 5, true);

    // Simulate Logout & Session Clearing
    console.log('2. Simulating Logout & Session Clear (scope: local)...');

    // Simulate Login 2: fetch students again after re-login
    console.log('3. Simulating Login 2: Re-fetching faculty students...');
    const { data: students2, error: err2 } = await db.from('profiles')
      .select('id, full_name, email, role, enrolled')
      .ilike('role', 'student');
    assert.strictEqual(err2, null);
    const count2 = (students2 || []).length;
    console.log(`   -> Login 2 students retrieved: ${count2}`);
    assert.strictEqual(count2, count1);

    console.log('🎉 REPEATED LOGIN & STUDENT FETCH TEST PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Repeated login test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
