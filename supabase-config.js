import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Public browser credentials only. Never place a secret/service-role key here.
const SUPABASE_URL = 'https://nkqsgqjprijmgmkzychf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_RKcYs55WAv0NDWgLMS3HZg_uWqKxKuk';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
