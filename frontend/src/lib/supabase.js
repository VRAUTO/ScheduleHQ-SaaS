import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your_supabase_url_here'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'

// Debug: Log the configuration (remove in production)
console.log('Supabase Config:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET'
});

// Validate configuration
if (supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('❌ Supabase configuration not set properly! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${window.location.origin}/auth/callback`,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
