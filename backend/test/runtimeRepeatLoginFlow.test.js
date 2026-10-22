import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from '../src/app.js';
import { getAdminClient } from '../src/config/supabase.js';

console.log('--- RUNNING RUNTIME REPEAT LOGIN FLOW TEST ---');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  try {
    const db = getAdminClient();
    assert.ok(db, 'Supabase admin client configured');

    // 1. Test backend login endpoint for faculty/staff
    console.log('1. Testing POST /api/auth/login for faculty...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'faculty@campus.edu', password: 'password123' })
    });
    
    const loginData = await loginRes.json();
    console.log('   -> Login 1 status:', loginRes.status, 'Has session:', !!loginData.session, 'Has access_token:', !!loginData.session?.access_token);
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginData.session?.access_token);

    const token1 = loginData.session.access_token;

    // 2. Fetch faculty students with token 1
    console.log('2. Fetching GET /api/faculty/students with Token 1...');
    const studentsRes1 = await fetch(`${baseUrl}/api/faculty/students`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const studentsData1 = await studentsRes1.json();
    console.log('   -> Students fetch 1 status:', studentsRes1.status, 'Count:', studentsData1.students?.length);
    assert.strictEqual(studentsRes1.status, 200);
    assert.strictEqual(studentsData1.students?.length, 5);

    // 3. Test login 2 (repeated login)
    console.log('3. Testing POST /api/auth/login (Second login)...');
    const loginRes2 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'faculty@campus.edu', password: 'password123' })
    });
    const loginData2 = await loginRes2.json();
    console.log('   -> Login 2 status:', loginRes2.status, 'Has session:', !!loginData2.session, 'Has access_token:', !!loginData2.session?.access_token);
    assert.strictEqual(loginRes2.status, 200);
    assert.ok(loginData2.session?.access_token);

    const token2 = loginData2.session.access_token;

    // 4. Fetch faculty students with token 2
    console.log('4. Fetching GET /api/faculty/students with Token 2 (Repeated login)...');
    const studentsRes2 = await fetch(`${baseUrl}/api/faculty/students`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const studentsData2 = await studentsRes2.json();
    console.log('   -> Students fetch 2 status:', studentsRes2.status, 'Count:', studentsData2.students?.length);
    assert.strictEqual(studentsRes2.status, 200);
    assert.strictEqual(studentsData2.students?.length, 5);

    console.log('🎉 RUNTIME REPEAT LOGIN FLOW TEST PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Runtime repeat login test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
