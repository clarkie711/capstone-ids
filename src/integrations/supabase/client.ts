import { createClient } from '@supabase/supabase-js';

console.log('Initializing Supabase client...');

// Use environment variables if available, otherwise use hardcoded values for development
const supabaseUrl = 'https://dytxrwaulirfzzfumyvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHhyd2F1bGlyZnp6ZnVteXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIyMDY5NzAsImV4cCI6MjAxNzc4Mjk3MH0.qDPHvNxGUE1lrXv3RyGZZ8iHJ9oGfZDNQUvOYVFZQnE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

console.log('Supabase client initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);