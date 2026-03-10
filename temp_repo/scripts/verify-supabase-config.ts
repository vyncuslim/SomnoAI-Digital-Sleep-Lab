import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function verify() {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      process.exit(1);
    }
    console.log('✅ Supabase configuration is valid and connection successful.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Unexpected error during Supabase verification:', err);
    process.exit(1);
  }
}

verify();
