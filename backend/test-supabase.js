import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thisdoesnotexistatall1234.supabase.co';
const supabaseKey = 'fakekey';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing...');
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    console.log('Returned error object:', error);
  } catch (e) {
    console.log('Caught exception:', e.message);
  }
}
test();
