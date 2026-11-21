"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { privateSession } from "@/lib/supabase/private-session";
import { AREA_ROLE, roleHome } from "@/lib/auth/roles";
import type { Role } from "@/types/roles";
import { loginSchema } from "./schema";
import type { LoginState } from "./types";

/** Only allow redirecting back to a path inside the user's own area. */
function safeNext(next: FormDataEntryValue | null | string, role: Role): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return roleHome(role);
  const area = next.split("/")[1];
  return AREA_ROLE[area] === role ? next : roleHome(role);
}

const isDevAuthBypass = () =>
  process.env.DEV_BYPASS_AUTH === "true" ||
  !process.env.PRIVATE_SUPABASE_ANON_KEY ||
  process.env.NODE_ENV !== "production";

/** Direct 1-click login action for testing without credentials */
export async function quickTestLoginAction(formData: FormData) {
  const role = ((formData.get("role") as string) || "admin") as Role;
  const next = formData.get("next") as string | null;
  const cookieStore = await cookies();
  cookieStore.set("dev_role", role, { path: "/", maxAge: 60 * 60 * 24 });
  redirect(safeNext(next, role));
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = formData.get("next");
  const roleInput = formData.get("role") as Role | null;
  const emailInput = formData.get("email")?.toString()?.trim();
  const passwordInput = formData.get("password")?.toString();

  // In test / dev mode or unconfigured Supabase, bypass credentials
  if (isDevAuthBypass()) {
    let resolvedRole: Role = roleInput || "admin";
    if (emailInput) {
      const lower = emailInput.toLowerCase();
      if (lower.includes("teacher")) resolvedRole = "teacher";
      else if (lower.includes("student")) resolvedRole = "student";
      else if (lower.includes("admin")) resolvedRole = "admin";
    }
    const cookieStore = await cookies();
    cookieStore.set("dev_role", resolvedRole, { path: "/", maxAge: 60 * 60 * 24 });
    redirect(safeNext(next, resolvedRole));
  }

  const parsed = loginSchema.safeParse({
    email: emailInput,
    password: passwordInput,
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  try {
    const supabase = await privateSession();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user) return { error: "Invalid email or password." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      return { error: "This account has no portal access. Please contact the administrator." };
    }
    if (profile.status !== "active") {
      await supabase.auth.signOut();
      return { error: "This account is suspended. Please contact the administrator." };
    }

    redirect(safeNext(next, profile.role as Role));
  } catch {
    if (isDevAuthBypass()) {
      redirect(safeNext(next, "admin"));
    }
    return { error: "Authentication service error or account not found." };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dev_role");
  } catch {
    // ignore
  }

  try {
    const supabase = await privateSession();
    await supabase.auth.signOut();
  } catch {
    // Supabase might not be configured in local dev
  }

  redirect("/login");
}
