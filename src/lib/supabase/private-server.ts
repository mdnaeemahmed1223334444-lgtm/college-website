import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * PRIVATE database (Supabase 2): students, teachers, attendance, results, fees + Auth.
 * - privateAnon():  anon key (used for login/auth calls).
 * - privateAdmin(): service role, bypasses RLS. ONLY use after verifying the caller's role.
 */
let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function privateAnon(): SupabaseClient | null {
  try {
    if (!anonClient) {
      const url = process.env.PRIVATE_SUPABASE_URL;
      const key = process.env.PRIVATE_SUPABASE_ANON_KEY;
      if (!url || !key || url.includes("xxxx.supabase.co")) {
        return null;
      }
      anonClient = createClient(url, key, {
        auth: { persistSession: false },
      });
    }
    return anonClient;
  } catch {
    return null;
  }
}

export function privateAdmin(): SupabaseClient | null {
  try {
    if (!adminClient) {
      const url = process.env.PRIVATE_SUPABASE_URL;
      const key = process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key || url.includes("xxxx.supabase.co")) {
        return null;
      }
      adminClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return adminClient;
  } catch {
    return null;
  }
}
