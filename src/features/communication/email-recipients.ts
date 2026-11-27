import "server-only";
import { getStudents, getBatches } from "@/features/students/queries";
import { getTeacherProfiles } from "@/features/staff/queries";
import type { BroadcastTarget, RecipientInfo } from "./email-types";

export interface ResolveRecipientsOptions {
  target: BroadcastTarget;
  batchId?: string;
  includeAlumni?: boolean;
  additionalEmails?: string | string[];
  excludedEmails?: string | string[];
  globalBlockedEmails?: string[];
  individualEmail?: string;
}

export interface ResolvedRecipientsResult {
  recipients: RecipientInfo[];
  blockedCount: number;
  blockedList: string[];
}

/**
 * Resolves all eligible email recipients according to admin audience criteria,
 * batch selection, alumni inclusion, additional custom emails, and suppression blocklists.
 */
export async function resolveBroadcastRecipients(
  options: ResolveRecipientsOptions
): Promise<ResolvedRecipientsResult> {
  const {
    target,
    batchId,
    includeAlumni = false,
    additionalEmails,
    excludedEmails,
    globalBlockedEmails = [],
    individualEmail,
  } = options;

  // 1. Build suppression/blacklist sets (both by lowercase email AND student/employee IDs)
  const blockSet = new Set<string>();

  // Add global blocked items
  for (const item of globalBlockedEmails) {
    if (item && item.trim()) {
      blockSet.add(item.trim().toLowerCase());
    }
  }

  // Add per-announcement exclusions
  const exclusionsArray = Array.isArray(excludedEmails)
    ? excludedEmails
    : (excludedEmails || "")
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  for (const item of exclusionsArray) {
    blockSet.add(item.trim().toLowerCase());
  }

  const rawRecipients: RecipientInfo[] = [];

  // 2. Fetch Students if needed
  if (target === "all" || target === "students" || target === "batch") {
    const students = await getStudents();

    for (const s of students) {
      if (!s.email || !s.email.includes("@")) continue;

      // Filter by status: unless includeAlumni is true, only include active students
      if (s.status !== "active" && !includeAlumni) {
        continue;
      }

      // Filter by batch if specified
      if (batchId && batchId !== "all" && s.batch_id !== batchId) {
        continue;
      }

      rawRecipients.push({
        email: s.email.trim(),
        name: s.full_name,
        role: "student",
        batchName: s.batch_name,
        batchId: s.batch_id,
        studentCode: s.student_code,
      });
    }
  }

  // 3. Fetch Teachers if needed
  if (target === "all" || target === "teachers") {
    const teachers = await getTeacherProfiles();

    for (const t of teachers) {
      const email = t.email?.trim();
      if (!email || !email.includes("@")) continue;

      rawRecipients.push({
        email,
        name: t.full_name,
        role: "teacher",
        employeeId: t.employee_id,
      });
    }
  }

  // 4. Handle Individual recipient
  if (target === "individual" && individualEmail) {
    const cleanInd = individualEmail.trim();
    if (cleanInd.includes("@")) {
      rawRecipients.push({
        email: cleanInd,
        name: cleanInd.split("@")[0],
        role: "custom",
      });
    }
  }

  // 5. Add custom extra emails
  const extraArray = Array.isArray(additionalEmails)
    ? additionalEmails
    : (additionalEmails || "")
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  for (const extra of extraArray) {
    if (extra.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extra)) {
      rawRecipients.push({
        email: extra,
        name: extra.split("@")[0],
        role: "custom",
      });
    }
  }

  // 6. Filter against blocklist (checking email, studentCode, and employeeId)
  const finalRecipientsMap = new Map<string, RecipientInfo>();
  const blockedIdentified = new Set<string>();

  for (const r of rawRecipients) {
    const emailLower = r.email.toLowerCase();
    const codeLower = r.studentCode?.toLowerCase();
    const empLower = r.employeeId?.toLowerCase();

    // Check if blocked by email or ID
    const isBlocked =
      blockSet.has(emailLower) ||
      (codeLower && blockSet.has(codeLower)) ||
      (empLower && blockSet.has(empLower));

    if (isBlocked) {
      blockedIdentified.add(r.email);
      continue;
    }

    if (!finalRecipientsMap.has(emailLower)) {
      finalRecipientsMap.set(emailLower, r);
    }
  }

  return {
    recipients: Array.from(finalRecipientsMap.values()),
    blockedCount: blockedIdentified.size,
    blockedList: Array.from(blockedIdentified),
  };
}
