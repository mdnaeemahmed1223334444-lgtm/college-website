import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv } from "@/config/env";

/**
 * Supabase client for the PRIVATE project that acts AS THE LOGGED-IN USER
 * (reads/writes the auth cookie, uses the anon key, respects RLS).
 * Use it for login/logout and for "who am I". Use privateAdmin() for data work.
 */
export async function privateSession() {
  const cookieStore = await cookies();
  const env = getEnv();

  return createServerClient(env.PRIVATE_SUPABASE_URL, env.PRIVATE_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list: Array<{ name: string; value: string; options?: any }>) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are refreshed by middleware instead.
        }
      },
    },
  });
}
