import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { getAdminClient } from '../src/config/supabase.js';

async function inspect() {
  const sb = getAdminClient();
  if (!sb) {
    console.log('No Supabase admin client');
    return;
  }
  
  const { data: profiles, error: errP } = await sb.from('profiles').select('*');
  console.log('Profiles:', errP ? errP.message : profiles?.length);
  if (profiles?.length) {
    console.log('Sample profile:', { id: profiles[0].id, name: profiles[0].full_name, email: profiles[0].email });
  }

  const { data: grades, error: errG } = await sb.from('grades').select('*');
  console.log('Grades:', errG ? errG.message : grades?.length);
  if (grades?.length) {
    console.log('Sample grade:', grades[0]);
  }

  const { data: payments, error: errPay } = await sb.from('payments').select('*');
  console.log('Payments:', errPay ? errPay.message : payments?.length);
  if (payments?.length) {
    console.log('Sample payment:', payments[0]);
  }
}

inspect().catch(console.error);
