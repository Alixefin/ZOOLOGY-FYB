import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and/or Anon Key are not defined. Please check your .env.local file and ensure it contains NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Remember to restart your development server after creating or modifying the .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
