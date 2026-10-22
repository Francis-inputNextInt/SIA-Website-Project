import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from '../src/app.js';
import { getAdminClient } from '../src/config/supabase.js';

console.log('--- RUNNING FACULTY STUDENTS API TEST SUITE ---');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test unauthenticated request -> should return 401
    console.log('✓ Testing GET /api/faculty/students without token -> expect 401');
    const resUnauth = await fetch(`${baseUrl}/api/faculty/students`);
    assert.strictEqual(resUnauth.status, 401);
    const jsonUnauth = await resUnauth.json();
    assert.ok(jsonUnauth.error);
    console.log('  -> Received expected 401 response:', jsonUnauth.error);

    // 2. Test with admin client directly fetching profiles
    const db = getAdminClient();
    assert.ok(db, 'Supabase admin client must be configured');
    const { data: profiles, error } = await db.from('profiles').select('id, full_name, email, role, enrolled, student_id');
    assert.strictEqual(error, null, 'Supabase query error should be null');
    assert.ok(Array.isArray(profiles), 'Profiles should be an array');
    
    const students = profiles.filter(p => (p.role || '').trim().toLowerCase() === 'student');
    console.log(`✓ Supabase direct query successful: ${profiles.length} total profiles, ${students.length} student profiles.`);
    assert.strictEqual(students.length >= 1, true, 'At least one student profile should exist');

    console.log('🎉 FACULTY STUDENTS API & DATABASE CHECK PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Faculty students API test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
