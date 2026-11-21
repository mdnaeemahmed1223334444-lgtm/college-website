import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { privateSession } from "@/lib/supabase/private-session";
import type { Role } from "@/types/roles";
import { roleHome, ROLE_LABEL } from "./roles";

export type CurrentUser = {
  id: string;
  email: string | null;
  fullName: string;
  role: Role;
};

const devBypass = () =>
  process.env.DEV_BYPASS_AUTH === "true" ||
  !process.env.PRIVATE_SUPABASE_ANON_KEY ||
  process.env.NODE_ENV !== "production";

/** The logged-in, ACTIVE user (or null). Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (devBypass()) {
    try {
      const cookieStore = await cookies();
      const devRole = (cookieStore.get("dev_role")?.value as Role) || "admin";
      return {
        id: "dev-user",
        email: `${devRole}@college.edu`,
        fullName: `Dev ${ROLE_LABEL[devRole] || devRole} (Test Mode)`,
        role: devRole,
      };
    } catch {
      return {
        id: "dev-user",
        email: "admin@college.edu",
        fullName: "Dev Administrator (Test Mode)",
        role: "admin",
      };
    }
  }

  try {
    const supabase = await privateSession();
    const {
      data: { user },
    } = await supabase.auth.getUser(); // validates the token with Supabase
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.status !== "active") return null;
    return { id: user.id, email: user.email ?? null, fullName: profile.full_name, role: profile.role as Role };
  } catch {
    return null;
  }
});

/**
 * Call at the top of every protected layout / page / server action / route handler.
 * Redirects to /login if logged out, or to the user's own area if the role is wrong.
 */
export async function requireRole(roles: Role[]): Promise<CurrentUser> {
  if (devBypass()) {
    let activeRole = roles[0];
    try {
      const cookieStore = await cookies();
      const devRole = cookieStore.get("dev_role")?.value as Role | undefined;
      if (devRole && roles.includes(devRole)) {
        activeRole = devRole;
      }
    } catch {
      // ignore
    }
    return {
      id: "dev-user",
      email: `${activeRole}@college.edu`,
      fullName: `Test ${ROLE_LABEL[activeRole] || activeRole}`,
      role: activeRole,
    };
  }
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}
