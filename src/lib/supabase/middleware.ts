import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/types/roles";

/**
 * Refreshes the session cookie and tells the middleware who the user is.
 * Reads env directly (not config/env.ts) because middleware runs on the edge.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.PRIVATE_SUPABASE_URL;
  const key = process.env.PRIVATE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { response, configured: false as const, userId: null, role: null, status: null };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list: Array<{ name: string; value: string; options?: any }>) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Role | null = null;
  let status: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role, status").eq("id", user.id).maybeSingle();
    role = (data?.role as Role) ?? null;
    status = data?.status ?? null;
  }

  return { response, configured: true as const, userId: user?.id ?? null, role, status };
}
