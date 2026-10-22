import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { getAdminClient } from '../src/config/supabase.js';

async function inspectProfiles() {
  console.log('=== RUNNING LIVE PROFILES DIAGNOSTIC INSPECTION ===');
  const db = getAdminClient();
  if (!db) {
    console.error('❌ Supabase admin client not configured in .env');
    return;
  }

  const { data, error } = await db.from('profiles').select('id, full_name, email, role, enrolled, student_id');
  if (error) {
    console.error('❌ Supabase query error:', error.message);
    return;
  }

  console.log('1. Supabase query error:', error ? error.message : 'None');
  console.log('2. Number of profiles returned before filtering:', data?.length || 0);
  
  if (data && data.length > 0) {
    console.log('   Profiles breakdown by role:');
    const roleCounts = {};
    data.forEach(p => {
      const r = (p.role || 'Unspecified').trim();
      roleCounts[r] = (roleCounts[r] || 0) + 1;
    });
    console.log('   ', roleCounts);
    console.log('   Sample profile rows:', data.slice(0, 5).map(p => ({ name: p.full_name, role: p.role, enrolled: p.enrolled })));
  }

  const students = (data || []).filter(p => {
    const r = (p.role || '').trim().toLowerCase();
    return r === 'student';
  });

  console.log('3. Number of students after case-insensitive role filter ("student"):', students.length);
  console.log('=== DIAGNOSTIC INSPECTION COMPLETE ===');
}

inspectProfiles().catch(err => console.error('Diagnostic error:', err));
