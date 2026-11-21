import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AREA_ROLE, roleHome } from "@/lib/auth/roles";

/**
 * First line of defence:
 *   /admin   -> admin only      /teacher -> teacher only      /student -> student only
 *   /login   -> logged-in users are sent to their own area
 * Layouts ALSO call requireRole() (second line), and data functions must check roles too.
 */
export async function middleware(request: NextRequest) {
  // Local preview without Supabase. Never active in production.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const { response, configured, userId, role, status } = await updateSession(request);

  // redirect while keeping any refreshed auth cookies
  const redirectTo = (path: string, params?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    Object.entries(params ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  const area = pathname.split("/")[1];
  const active = Boolean(userId && role && status === "active");

  if (area === "login") {
    return active && role ? redirectTo(roleHome(role)) : response;
  }

  if (!configured) return redirectTo("/login", { error: "config" });
  if (!active || !role) return redirectTo("/login", { next: pathname });
  if (AREA_ROLE[area] !== role) return redirectTo(roleHome(role));

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login"],
};
