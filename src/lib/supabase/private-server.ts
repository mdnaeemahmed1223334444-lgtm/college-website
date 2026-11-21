import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/config/env";

/**
 * PRIVATE database (Supabase 2): students, teachers, attendance, results, fees + Auth.
 * - privateAnon():  anon key (used for login/auth calls in Part 2).
 * - privateAdmin(): service role, bypasses RLS. ONLY use after verifying the caller's role.
 */
let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function privateAnon(): SupabaseClient {
  if (!anonClient) {
    const env = getEnv();
    anonClient = createClient(env.PRIVATE_SUPABASE_URL, env.PRIVATE_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return anonClient;
}

export function privateAdmin(): SupabaseClient {
  if (!adminClient) {
    const env = getEnv();
    adminClient = createClient(env.PRIVATE_SUPABASE_URL, env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
