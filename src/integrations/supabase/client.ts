import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client...');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

console.log('Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'network-monitor',
    },
  },
});