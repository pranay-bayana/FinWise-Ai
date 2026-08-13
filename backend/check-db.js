import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error('Error querying users:', error.message);
    if (error.code === '42P01') {
      console.log('Table users does not exist. The DB is accessible but empty.');
    }
  } else {
    console.log('Connection successful, users table exists.');
  }
}
check();
