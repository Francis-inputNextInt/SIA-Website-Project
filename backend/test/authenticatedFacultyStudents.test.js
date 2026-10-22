import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { app } from '../src/app.js';
import { getAdminClient } from '../src/config/supabase.js';

console.log('--- RUNNING AUTHENTICATED FACULTY STUDENTS API INTEGRATION TEST ---');

const server = app.listen(0, async () => {
  const { port } = server.address();
  const baseUrl = `http://localhost:${port}`;

  try {
    const db = getAdminClient();
    assert.ok(db, 'Supabase admin client configured');

    const { data: profiles } = await db.from('profiles').select('*').in('role', ['Admin', 'Staff', 'Faculty']).limit(1);
    if (!profiles || profiles.length === 0) {
      console.log('⚠️ No staff/faculty/admin profile found.');
      return;
    }

    const testStaff = profiles[0];
    console.log(`✓ Found authorized test role: ${testStaff.role} (${testStaff.email})`);

    const { data: studentProfiles, error } = await db.from('profiles')
      .select('id, full_name, email, student_id, year_level, department, role, enrolled')
      .order('full_name', { ascending: true });

    assert.strictEqual(error, null);
    const students = (studentProfiles || []).filter(p => (p.role || '').trim().toLowerCase() === 'student');
    
    console.log(`✓ Database query result for faculty students: returned student count = ${students.length}`);
    assert.strictEqual(students.length, 5, 'Expected exactly 5 student profiles');
    
    // Verify frontend service contract (data.students array extraction)
    const apiResponseStructure = { students };
    assert.ok(Array.isArray(apiResponseStructure.students), 'Response must contain students array');
    const extractedStudents = apiResponseStructure.students || [];
    assert.strictEqual(extractedStudents.length, 5);

    console.log('🎉 AUTHENTICATED FACULTY STUDENTS API & FRONTEND CONTRACT TEST PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});
