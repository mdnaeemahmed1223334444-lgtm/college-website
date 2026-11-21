import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AREA_ROLE, roleHome } from "@/lib/auth/roles";
import type { Role } from "@/types/roles";

/**
 * First line of defence:
 *   /admin   -> admin only      /teacher -> teacher only      /student -> student only
 *   /login   -> logged-in users are sent to their own area
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const area = pathname.split("/")[1];

  // Testing bypass active when DEV_BYPASS_AUTH="true" OR when Supabase keys are not configured yet
  const isBypass =
    process.env.DEV_BYPASS_AUTH === "true" ||
    !process.env.PRIVATE_SUPABASE_ANON_KEY ||
    process.env.NODE_ENV !== "production";

  if (isBypass) {
    if (area === "login") {
      return NextResponse.next();
    }

    if (AREA_ROLE[area]) {
      const targetRole = AREA_ROLE[area] as Role;
      const res = NextResponse.next();
      const currentDevRole = request.cookies.get("dev_role")?.value;
      if (currentDevRole !== targetRole) {
        res.cookies.set("dev_role", targetRole, { path: "/", maxAge: 60 * 60 * 24 });
      }
      return res;
    }

    return NextResponse.next();
  }

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
