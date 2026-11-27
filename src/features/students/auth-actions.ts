"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { privateAdmin } from "@/lib/supabase/private-server";
import { requireRole } from "@/lib/auth/current-user";
import {
  hashPassword,
  verifyPassword,
  createStudentSession,
  destroyStudentSession,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
} from "./auth";

export interface StudentAuthFeedback {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Server action for Student Login at /student/login
 */
export async function studentLoginAction(
  _prev: StudentAuthFeedback,
  formData: FormData
): Promise<StudentAuthFeedback> {
  const studentIdRaw = (formData.get("student_id") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!studentIdRaw || !password) {
    return { error: "Please enter your Student ID and password." };
  }

  // Rate Limiting / Brute-Force Check
  const rateLimit = checkRateLimit(studentIdRaw.toLowerCase());
  if (!rateLimit.allowed) {
    return {
      error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
    };
  }

  const privClient = privateAdmin();
  if (!privClient) {
    return { error: "Authentication system is currently offline. Please try again later." };
  }

  try {
    // 1. Resolve student by student_code (or id if UUID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentIdRaw);
    let studentQuery = privClient
      .from("students")
      .select("id, student_code, full_name, status, notes, password_hash");

    if (isUuid) {
      studentQuery = studentQuery.or(`student_code.ilike.${studentIdRaw},id.eq.${studentIdRaw}`);
    } else {
      studentQuery = studentQuery.or(`student_code.ilike.${studentIdRaw},email.ilike.${studentIdRaw}`);
    }

    const { data: student, error } = await studentQuery.maybeSingle();

    if (error || !student) {
      recordFailedAttempt(studentIdRaw.toLowerCase());
      return { error: "Invalid Student ID or password." };
    }

    // 2. Check if account is active
    if (student.status !== "active") {
      return {
        error:
          student.status === "suspended"
            ? "Your student account has been suspended. Please contact the college administration."
            : "Your student profile is no longer active in the college portal.",
      };
    }

    // 3. Retrieve password hash
    let passwordHash: string | undefined = undefined;

    // Check if column exists or read from notes JSON
    if ((student as any).password_hash) {
      passwordHash = (student as any).password_hash;
    } else if (student.notes && student.notes.startsWith("{") && student.notes.endsWith("}")) {
      try {
        const parsed = JSON.parse(student.notes);
        passwordHash = parsed.password_hash;
      } catch {
        // ignore
      }
    }

    // Default test password for initial onboarding if not yet set: "student123"
    if (!passwordHash) {
      if (password === "student123" || password === student.student_code) {
        // Automatically hash and save
        const initialHash = await hashPassword(password);
        let updatedNotes = student.notes || "";
        try {
          const notesObj = updatedNotes.startsWith("{") ? JSON.parse(updatedNotes) : {};
          notesObj.password_hash = initialHash;
          notesObj.current_password = password;
          updatedNotes = JSON.stringify(notesObj);
        } catch {
          updatedNotes = JSON.stringify({ password_hash: initialHash, current_password: password });
        }

        await privClient
          .from("students")
          .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
          .eq("id", student.id);

        passwordHash = initialHash;
      } else {
        recordFailedAttempt(studentIdRaw.toLowerCase());
        return {
          error:
            "Your account password has not been set by the administrator yet. Contact the college office.",
        };
      }
    }

    // 4. Verify password with bcrypt
    const isValid = await verifyPassword(password, passwordHash);
    if (!isValid) {
      recordFailedAttempt(studentIdRaw.toLowerCase());
      return { error: "Invalid Student ID or password." };
    }

    // Success! Reset failed attempts
    resetFailedAttempts(studentIdRaw.toLowerCase());

    // Create secure persistent cookie session
    await createStudentSession(student.id);
  } catch (err) {
    console.error("Student login error:", err);
    return { error: "A server error occurred during authentication. Please try again." };
  }

  // Redirect to student dashboard
  redirect("/student/dashboard");
}

/**
 * Server action for Student Logout
 */
export async function studentLogoutAction(): Promise<void> {
  await destroyStudentSession();
  redirect("/student/login");
}

/**
 * Admin action to assign or reset a student's password
 */
export async function adminResetStudentPasswordAction(
  studentId: string,
  newPassword: string
): Promise<StudentAuthFeedback> {
  try {
    await requireRole(["admin"]);

    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const privClient = privateAdmin();
    if (!privClient) {
      return { error: "Database connection unavailable." };
    }

    // 1. Hash new password with bcrypt
    const hashed = await hashPassword(newPassword);

    // 2. Fetch existing student
    const { data: student, error: fetchErr } = await privClient
      .from("students")
      .select("id, student_code, full_name, notes")
      .eq("id", studentId)
      .single();

    if (fetchErr || !student) {
      return { error: "Student not found." };
    }

    // 3. Update notes JSON
    let notesObj: Record<string, any> = {};
    if (student.notes && student.notes.startsWith("{") && student.notes.endsWith("}")) {
      try {
        notesObj = JSON.parse(student.notes);
      } catch {
        notesObj = {};
      }
    }
    notesObj.password_hash = hashed;
    notesObj.current_password = newPassword;
    notesObj.password_updated_at = new Date().toISOString();

    const { error: updateErr } = await privClient
      .from("students")
      .update({
        notes: JSON.stringify(notesObj),
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);

    if (updateErr) throw updateErr;

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);

    return {
      success: true,
      message: `Password for ${student.full_name} (${student.student_code}) has been reset successfully.`,
    };
  } catch (err: any) {
    console.error("adminResetStudentPasswordAction error:", err);
    return { error: err.message || "Failed to reset student password." };
  }
}
