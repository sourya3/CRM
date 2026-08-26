import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

declare global {
  var __supabaseInstance: SupabaseClient | undefined;
}

export const supabase =
  globalThis.__supabaseInstance ||
  (globalThis.__supabaseInstance = createClient(supabaseUrl, supabaseAnonKey));
