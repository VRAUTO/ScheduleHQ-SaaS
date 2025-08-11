const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables for backend:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌ Missing');
  throw new Error('Supabase configuration missing');
}

// Create client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create client for user authentication (uses anon key)
const supabaseAuth = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || supabaseServiceKey);

console.log('✅ Supabase backend client initialized with service role');

module.exports = {
  supabase,      // Service role client (bypasses RLS)
  supabaseAuth   // Auth client for user verification
};