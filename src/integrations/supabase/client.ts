import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://dytxrwaulirfzzfumyvv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHhyd2F1bGlyZnp6ZnVteXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MDk2NTgsImV4cCI6MjA0ODM4NTY1OH0.v5kgQcSkbSRr-xM32d3akrUsIZcUu3_dFV4H9PlCX_E";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);