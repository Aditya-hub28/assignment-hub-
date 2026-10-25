import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zgiinylfcemvemgyvkbv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWlueWxmY2VtdmVtZ3l2a2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTE1MTMsImV4cCI6MjEwODQ4NzUxM30.NzRGoXj0_6tne97lfcpoE5tpTbIFO5WyBoUz6PImDvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
