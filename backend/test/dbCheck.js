/**
 * Database check and auto-migration script for Supabase tables
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { getAdminClient } from '../src/config/supabase.js';

async function checkAndInitTables() {
  const sb = getAdminClient();
  if (!sb) {
    console.error('❌ Supabase admin client not configured. Check backend/.env');
    return;
  }
  console.log('✅ Supabase admin client loaded successfully.');

  // Check profiles
  const { error: errProf } = await sb.from('profiles').select('id').limit(1);
  if (errProf) console.log('⚠️ profiles table check:', errProf.message);
  else console.log('✅ profiles table exists.');

  // Check service_requests
  const { error: errReq } = await sb.from('service_requests').select('id').limit(1);
  if (errReq) {
    console.log('⚠️ service_requests table missing or error:', errReq.message);
  } else {
    console.log('✅ service_requests table exists.');
  }

  // Check announcements
  const { error: errAnn } = await sb.from('announcements').select('id').limit(1);
  if (errAnn) {
    console.log('⚠️ announcements table missing or error:', errAnn.message);
  } else {
    console.log('✅ announcements table exists.');
  }

  // Check system_logs
  const { error: errLog } = await sb.from('system_logs').select('id').limit(1);
  if (errLog) {
    console.log('⚠️ system_logs table missing or error:', errLog.message);
  } else {
    console.log('✅ system_logs table exists.');
  }
}

checkAndInitTables().catch(console.error);
