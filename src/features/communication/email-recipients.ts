import "server-only";
import { getStudents } from "@/features/students/queries";
import { getTeacherProfiles } from "@/features/staff/queries";
import type { BroadcastTarget, RecipientInfo } from "./email-types";

export interface ResolveRecipientsOptions {
  target: BroadcastTarget;
  batchId?: string;
  batchIds?: string[];
  studyGroup?: "all" | "science" | "business_studies" | "humanities";
  includeAlumni?: boolean;
  additionalEmails?: string | string[];
  excludedEmails?: string | string[];
  excludedStudentIds?: string[];
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
 * batch selection, major/study group, alumni inclusion, additional custom emails,
 * and suppression blocklists (including unchecked student checkboxes).
 */
export async function resolveBroadcastRecipients(
  options: ResolveRecipientsOptions
): Promise<ResolvedRecipientsResult> {
  const {
    target,
    batchId,
    batchIds,
    studyGroup,
    includeAlumni = false,
    additionalEmails,
    excludedEmails,
    excludedStudentIds = [],
    globalBlockedEmails = [],
    individualEmail,
  } = options;

  // 1. Build suppression/blacklist sets (lowercase emails, student codes, student UUIDs, and employee IDs)
  const blockSet = new Set<string>();

  // Add global saved blocked items
  for (const item of globalBlockedEmails) {
    if (item && item.trim()) {
      blockSet.add(item.trim().toLowerCase());
    }
  }

  // Add per-announcement excluded emails/IDs
  const exclusionsArray = Array.isArray(excludedEmails)
    ? excludedEmails
    : (excludedEmails || "")
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  for (const item of exclusionsArray) {
    blockSet.add(item.trim().toLowerCase());
  }

  // Add individually deselected student IDs
  for (const sId of excludedStudentIds) {
    if (sId && sId.trim()) {
      blockSet.add(sId.trim().toLowerCase());
    }
  }

  const rawRecipients: RecipientInfo[] = [];

  // Determine if students should be included
  const includeStudents =
    target === "all" ||
    target === "students" ||
    target === "batch" ||
    target === "science" ||
    target === "business_studies" ||
    target === "humanities";

  if (includeStudents) {
    const students = await getStudents();

    for (const s of students) {
      if (!s.email || !s.email.includes("@")) continue;

      // Filter by status: unless includeAlumni is true, only include active students
      if (s.status !== "active" && !includeAlumni) {
        continue;
      }

      // Filter by major / study group
      const desiredGroup =
        studyGroup && studyGroup !== "all"
          ? studyGroup
          : target === "science"
          ? "science"
          : target === "business_studies"
          ? "business_studies"
          : target === "humanities"
          ? "humanities"
          : null;

      if (desiredGroup && s.study_group !== desiredGroup) {
        continue;
      }

      // Filter by batch if specified
      if (batchIds && batchIds.length > 0) {
        if (!batchIds.includes(s.batch_id)) continue;
      } else if (batchId && batchId !== "all" && batchId !== "all_running") {
        if (s.batch_id !== batchId) continue;
      }

      // Check if student was individually deselected via ID or student_code
      if (
        blockSet.has(s.id.toLowerCase()) ||
        blockSet.has(s.student_code.toLowerCase())
      ) {
        continue;
      }

      rawRecipients.push({
        email: s.email.trim(),
        name: s.full_name,
        role: "student",
        batchName: s.batch_name,
        batchId: s.batch_id,
        studyGroup: s.study_group,
        studentCode: s.student_code,
        studentId: s.id,
      });
    }
  }

  // 2. Fetch Teachers if needed
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

  // 3. Handle Individual recipient
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

  // 4. Add custom additional emails
  const extraArray = Array.isArray(additionalEmails)
    ? additionalEmails
    : (additionalEmails || "")
        .split(/[,\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

  for (const extra of extraArray) {
    if (extra.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extra)) {
      rawRecipients.push({
        email: extra.trim(),
        name: extra.split("@")[0],
        role: "custom",
      });
    }
  }

  // 5. Final pass against blockset (checking email, studentCode, and employeeId)
  const finalRecipientsMap = new Map<string, RecipientInfo>();
  const blockedIdentified = new Set<string>();

  for (const r of rawRecipients) {
    const emailLower = r.email.toLowerCase();
    const codeLower = r.studentCode?.toLowerCase();
    const idLower = r.studentId?.toLowerCase();
    const empLower = r.employeeId?.toLowerCase();

    // Check if blocked
    const isBlocked =
      blockSet.has(emailLower) ||
      (codeLower && blockSet.has(codeLower)) ||
      (idLower && blockSet.has(idLower)) ||
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
