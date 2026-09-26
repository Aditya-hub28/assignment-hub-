const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('[WARN] SUPABASE_URL or SUPABASE_ANON_KEY is not configured in .env');
}

/**
 * Standard Supabase client (Anon Key)
 * Respects Row Level Security (RLS)
 */
const supabase = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

/**
 * Admin Supabase client (Service Role Key)
 * Bypasses RLS - strictly for server-side trusted operations
 * (e.g., creating auth users after OTP verification, accessing otp_verifications table)
 */
const supabaseAdmin = createClient(
  env.SUPABASE_URL || 'https://placeholder.supabase.co',
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || 'placeholder-service-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

/**
 * Creates a scoped Supabase client with the user's JWT access token
 * Ensures all queries executed with this client are constrained by the user's RLS policies
 */
const createScopedClient = (accessToken) => {
  return createClient(
    env.SUPABASE_URL || 'https://placeholder.supabase.co',
    env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
};

module.exports = {
  supabase,
  supabaseAdmin,
  createScopedClient
};
