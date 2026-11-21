import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/config/env";

/**
 * MAIN database (Supabase 1): public website content.
 * - mainPublic(): anon key, respects RLS (read published content only).
 * - mainAdmin():  service role, bypasses RLS. ONLY use after verifying admin role.
 */
let publicClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function mainPublic(): SupabaseClient | null {
  try {
    if (!publicClient) {
      const env = getEnv();
      if (!env.MAIN_SUPABASE_URL || !env.MAIN_SUPABASE_ANON_KEY || env.MAIN_SUPABASE_URL.includes("xxxx.supabase.co")) {
        return null;
      }
      publicClient = createClient(env.MAIN_SUPABASE_URL, env.MAIN_SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
    }
    return publicClient;
  } catch {
    return null;
  }
}

export function mainAdmin(): SupabaseClient | null {
  try {
    if (!adminClient) {
      const env = getEnv();
      if (!env.MAIN_SUPABASE_URL || !env.MAIN_SUPABASE_SERVICE_ROLE_KEY || env.MAIN_SUPABASE_URL.includes("xxxx.supabase.co")) {
        return null;
      }
      adminClient = createClient(env.MAIN_SUPABASE_URL, env.MAIN_SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return adminClient;
  } catch {
    return null;
  }
}
