import "server-only";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { StudentRecord } from "./types";

const SESSION_COOKIE_NAME = "student_session";
const SESSION_SECRET =
  process.env.PRIVATE_SUPABASE_SERVICE_ROLE_KEY || "college-student-portal-secret-key-2026";
const MAX_SESSION_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Hash a plain text password with bcrypt (10 rounds).
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

/**
 * Verify a plain text password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Sign session payload: "studentId:sessionToken:expiryTimestamp"
 */
function signPayload(payload: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

/**
 * Verify and unpack signed session token. Returns null if invalid or expired.
 */
function verifyPayload(signed: string): { studentId: string; token: string } | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = signed.slice(0, lastDot);
  const signature = signed.slice(lastDot + 1);

  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  if (signature !== expectedSignature) return null;

  const parts = payload.split(":");
  if (parts.length < 3) return null;

  const [studentId, token, expiryStr] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return null;

  return { studentId, token };
}

/**
 * In-memory brute force tracker (IP / Student ID -> failed attempts & lockout)
 */
interface AttemptTracker {
  count: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, AttemptTracker>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  if (record.lockedUntil > now) {
    const seconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: seconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock out for 15 minutes after 5 consecutive failed attempts
    record.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(key, record);
}

export function resetFailedAttempts(key: string): void {
  loginAttempts.delete(key);
}

/**
 * Creates and sets an authenticated persistent student session cookie.
 */
export async function createStudentSession(studentId: string): Promise<string> {
  const randomToken = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + MAX_SESSION_AGE * 1000;
  const payload = `${studentId}:${randomToken}:${expiry}`;
  const signedCookieValue = signPayload(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_SESSION_AGE,
  });

  return randomToken;
}

/**
 * Destroys the current student session and clears the cookie.
 */
export async function destroyStudentSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // ignore
  }
}

/**
 * Retrieves the currently logged-in student from the persistent session.
 * Enforces:
 * - Cookie presence & cryptographic signature
 * - 30-day expiration check
 * - Server database lookup
 * - Account active status (deactivated accounts lose access immediately)
 */
export async function getAuthenticatedStudent(): Promise<StudentRecord | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    const verified = verifyPayload(sessionCookie);
    if (!verified) {
      await destroyStudentSession();
      return null;
    }

    const privClient = privateAdmin();
    if (!privClient) return null;

    const { data: student, error } = await privClient
      .from("students")
      .select(`
        *,
        batches:batch_id (
          id,
          name
        )
      `)
      .eq("id", verified.studentId)
      .maybeSingle();

    if (error || !student) {
      await destroyStudentSession();
      return null;
    }

    // Account active check (part 3.2 item 7: If the admin deactivates an account, student must lose access)
    if (student.status !== "active") {
      await destroyStudentSession();
      return null;
    }

    // Parse extended data from notes if present
    let extendedData: Record<string, any> = {};
    if (student.notes) {
      try {
        if (student.notes.startsWith("{") && student.notes.endsWith("}")) {
          extendedData = JSON.parse(student.notes);
        }
      } catch {
        // regular notes
      }
    }

    const batch = student.batches;
    return {
      id: student.id,
      profile_id: student.profile_id,
      student_code: student.student_code,
      full_name: student.full_name,
      bangla_name: student.bangla_name,
      batch_id: student.batch_id,
      batch_name: batch?.name || "General",
      study_group: student.study_group,
      roll: student.roll,
      section: student.section,
      status: student.status,
      gender: student.gender,
      religion: student.religion,
      date_of_birth: student.date_of_birth,
      blood_group: student.blood_group,
      phone: student.phone,
      email: student.email,
      address: student.address,
      permanent_address: student.permanent_address,
      father_name: student.father_name,
      father_phone: student.father_phone,
      mother_name: student.mother_name,
      mother_phone: student.mother_phone,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      guardian_relation: student.guardian_relation,
      photo_url: student.photo_url || student.photo_key,
      photo_key: student.photo_key,
      rfid_card_id: student.rfid_card_id,
      rfid_card_data: student.rfid_card_data,
      academic_session: student.academic_session || extendedData.academic_session || "2025-2026",
      admission_date: student.admission_date || extendedData.admission_date,
      registration_number: student.registration_number || extendedData.registration_number,
      previous_institution: student.previous_institution || extendedData.previous_institution,
      document_url: student.document_url || extendedData.document_url,
      document_name: student.document_name || extendedData.document_name,
      has_password: Boolean(student.password_hash || extendedData.password_hash),
      password_hash: student.password_hash || extendedData.password_hash,
      notes: extendedData.admin_notes || student.notes,
      created_at: student.created_at,
      updated_at: student.updated_at,
    };
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes?.("Dynamic server usage")) {
      throw err;
    }
    console.error("Error authenticating student session:", err);
    return null;
  }
}
