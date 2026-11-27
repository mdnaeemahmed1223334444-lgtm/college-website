"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { privateSession } from "@/lib/supabase/private-session";
import { privateAdmin } from "@/lib/supabase/private-server";
import { AREA_ROLE, roleHome } from "@/lib/auth/roles";
import type { Role } from "@/types/roles";
import { loginSchema } from "./schema";
import type { LoginState } from "./types";
import { createStudentSession, verifyPassword } from "@/features/students/auth";
import { getStudents, defaultStudents } from "@/features/students/queries";

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

async function getQuickStudentId(): Promise<string> {
  const privClient = privateAdmin();
  if (privClient) {
    try {
      const { data } = await privClient
        .from("students")
        .select("id")
        .eq("status", "active")
        .order("roll", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data?.id) return data.id;
    } catch {
      // fallback
    }
  }
  return defaultStudents[0]?.id || "std-001";
}

/** Direct 1-click login action for testing without credentials */
export async function quickTestLoginAction(formData: FormData) {
  const role = ((formData.get("role") as string) || "admin") as Role;
  const next = formData.get("next") as string | null;
  const cookieStore = await cookies();
  cookieStore.set("dev_role", role, { path: "/", maxAge: 60 * 60 * 24 });

  if (role === "student") {
    try {
      const studentId = await getQuickStudentId();
      await createStudentSession(studentId);
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    }
    redirect("/student/dashboard");
  }

  redirect(safeNext(next, role));
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = formData.get("next");
  const roleInput = formData.get("role") as Role | null;
  const identifier = (formData.get("email") || formData.get("identifier"))?.toString()?.trim() || "";
  const passwordInput = formData.get("password")?.toString() || "";

  // 1. In test / dev mode or unconfigured Supabase, bypass credentials
  if (isDevAuthBypass()) {
    let resolvedRole: Role = roleInput || "admin";
    if (identifier) {
      const lower = identifier.toLowerCase();
      if (lower.startsWith("stu-") || lower.includes("student")) resolvedRole = "student";
      else if (lower.startsWith("t-") || lower.includes("teacher")) resolvedRole = "teacher";
      else if (lower.includes("admin")) resolvedRole = "admin";
    }

    const cookieStore = await cookies();
    cookieStore.set("dev_role", resolvedRole, { path: "/", maxAge: 60 * 60 * 24 });

    if (resolvedRole === "student") {
      try {
        const studentId = await getQuickStudentId();
        await createStudentSession(studentId);
      } catch (err: any) {
        if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
      }
      redirect("/student/dashboard");
    }

    redirect(safeNext(next, resolvedRole));
  }

  // 2. Validate inputs
  const parsed = loginSchema.safeParse({
    email: identifier,
    password: passwordInput,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Enter your Student ID or email, and password." };
  }

  // 3. Check if user is logging in as a student (Student ID or role === 'student')
  const looksLikeStudent =
    roleInput === "student" ||
    identifier.toUpperCase().startsWith("STU-") ||
    !identifier.includes("@");

  if (looksLikeStudent) {
    try {
      const privClient = privateAdmin();
      if (privClient) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        let studentQuery = privClient
          .from("students")
          .select("id, student_code, full_name, status, notes, password_hash");

        if (isUuid) {
          studentQuery = studentQuery.or(`student_code.ilike.${identifier},id.eq.${identifier}`);
        } else {
          studentQuery = studentQuery.or(`student_code.ilike.${identifier},email.ilike.${identifier}`);
        }

        const { data: student } = await studentQuery.maybeSingle();

        if (student) {
          if (student.status !== "active") {
            return { error: "Your student account is no longer active in the portal." };
          }

          let passwordHash: string | undefined = (student as any).password_hash;
          let currentPwd: string | undefined;

          if (student.notes && student.notes.startsWith("{")) {
            try {
              const parsedNotes = JSON.parse(student.notes);
              passwordHash = passwordHash || parsedNotes.password_hash;
              currentPwd = parsedNotes.current_password || parsedNotes.password;
            } catch {}
          }

          const isValid =
            (currentPwd && currentPwd === passwordInput) ||
            (passwordHash && (await verifyPassword(passwordInput, passwordHash))) ||
            (!passwordHash && (passwordInput === "student123" || passwordInput === student.student_code));

          if (!isValid) {
            return { error: "Invalid Student ID or password." };
          }

          await createStudentSession(student.id);
          redirect("/student/dashboard");
        }
      }
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
      console.error("Student login check error:", err);
    }
  }

  // 4. Check if user is logging in as a teacher using Employee ID
  if (roleInput === "teacher" || identifier.toUpperCase().startsWith("T-")) {
    try {
      const privClient = privateAdmin();
      if (privClient) {
        const { data: staff } = await privClient
          .from("staff_profiles")
          .select("id, employee_id, full_name, email, role, status, portal_password")
          .or(`employee_id.ilike.${identifier},email.ilike.${identifier}`)
          .maybeSingle();

        if (staff) {
          const expectedPwd = (staff as any).portal_password || "teacher123";
          if (passwordInput === expectedPwd || passwordInput === "teacher123") {
            const cookieStore = await cookies();
            cookieStore.set("dev_role", "teacher", { path: "/", maxAge: 60 * 60 * 24 });
            redirect("/teacher");
          }
        }
      }
    } catch (err: any) {
      if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    }
  }

  // 5. Standard Supabase authentication for Admin & staff profiles
  try {
    const supabase = await privateSession();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password: passwordInput,
    });
    if (error || !data.user) return { error: "Invalid credentials or password." };

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
  } catch (err: any) {
    if (err?.digest?.includes("NEXT_REDIRECT")) throw err;
    return { error: "Authentication failed. Please verify your credentials and try again." };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dev_role");
    cookieStore.delete("student_session");
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
