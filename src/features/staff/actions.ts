"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { privateAdmin } from "@/lib/supabase/private-server";
import { deleteUploadedFile } from "@/lib/storage/uploader";
import { staffProfileSchema, staffAssignmentSchema, staffStatusSchema } from "./schema";
import type { StaffFeedback } from "./types";

function extractErrorMessage(err: any, fallback: string): string {
  const msg =
    err?.message ||
    err?.error_description ||
    (err instanceof Error ? err.message : typeof err === "string" ? err : fallback);
  const hint = err?.hint ? ` (Hint: ${err.hint})` : err?.details ? ` (${err.details})` : "";
  return `${msg}${hint}`;
}

function normalizeDate(raw?: string | null): string {
  if (!raw || !raw.trim()) return new Date().toISOString().split("T")[0];
  const s = raw.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [m, d, y] = s.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
}

function normalizeOptionalDate(raw?: string | null): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  const s = raw.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [m, d, y] = s.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parsed = new Date(s);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : undefined;
}

export async function saveStaffProfileAction(
  _prevState: StaffFeedback,
  formData: FormData
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    const id = (formData.get("id") as string) || undefined;
    const rawRole = formData.get("role") as string;
    const isTeacher = rawRole === "teacher";

    // Auto-generate employee_id if empty
    let employee_id = (formData.get("employee_id") as string)?.trim();
    if (!employee_id) {
      const randNum = Math.floor(100 + Math.random() * 900);
      employee_id = isTeacher ? `T-${randNum}` : `S-${randNum}`;
    }

    const assignedSubjectsRaw = formData.get("assigned_subjects") as string;
    const assignedClassesRaw = formData.get("assigned_classes") as string;

    const assigned_subjects = assignedSubjectsRaw
      ? assignedSubjectsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const assigned_classes = assignedClassesRaw
      ? assignedClassesRaw
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    // Helper: formData.get() returns null for missing fields; Zod .string() rejects null
    const str = (key: string): string => (formData.get(key) as string) ?? "";
    const opt = (key: string): string | undefined => (formData.get(key) as string) || undefined;

    const parsed = staffProfileSchema.safeParse({
      id,
      employee_id,
      full_name: str("full_name"),
      bangla_name: opt("bangla_name"),
      role: str("role") || "teacher",
      designation: str("designation"),
      department: str("department"),
      email: str("email"),
      phone: str("phone"),
      gender: str("gender") || "male",
      blood_group: str("blood_group") || "A+",
      religion: opt("religion"),
      date_of_birth: normalizeOptionalDate(opt("date_of_birth")),
      nid: opt("nid"),
      present_address: opt("present_address"),
      permanent_address: opt("permanent_address"),
      highest_degree: str("highest_degree"),
      institution: opt("institution"),
      specialization: opt("specialization"),
      experience_years: str("experience_years") || 0,
      joining_date: normalizeDate(str("joining_date")),
      employment_type: str("employment_type") || "permanent",
      status: str("status") || "active",
      photo_url: opt("photo_url"),
      bio: opt("bio"),
      room_number: opt("room_number"),
      is_head_of_department: formData.get("is_head_of_department") === "true" || formData.get("is_head_of_department") === "on",
      is_class_teacher: formData.get("is_class_teacher") === "true" || formData.get("is_class_teacher") === "on",
      class_teacher_section: opt("class_teacher_section"),
      weekly_periods: str("weekly_periods") || 0,
      assigned_subjects,
      assigned_classes,
      display_order: str("display_order") || 0,
      show_on_website: formData.get("show_on_website") !== "false",
    });

    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Validation failed";
      return { error: err };
    }

    const payload: Record<string, any> = { ...parsed.data };
    const privClient = privateAdmin();

    if (privClient) {
      if (id) {
        // If photo was changed, automatically delete the old unused photo from the website
        const { data: existing } = await privClient
          .from("staff_profiles")
          .select("photo_url")
          .eq("id", id)
          .single();
        if (existing?.photo_url && existing.photo_url !== payload.photo_url) {
          await deleteUploadedFile(existing.photo_url);
        }

        const { error } = await privClient
          .from("staff_profiles")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw error;
      } else {
        // Remove undefined/null id so PostgreSQL uses default gen_random_uuid()
        delete payload.id;

        const { error } = await privClient.from("staff_profiles").insert({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    }

    revalidatePath("/admin/staff");
    revalidatePath("/admin/staff/list");
    revalidatePath("/admin/staff/profiles");
    revalidatePath("/admin/staff/departments");
    revalidatePath("/admin/staff/subjects");
    revalidatePath("/admin/staff/class-section");
    revalidatePath("/admin/staff/workload");
    revalidatePath("/about/teachers");
    revalidatePath("/about/staff");

    return {
      success: true,
      message: id
        ? `Profile for ${payload.full_name} (${payload.employee_id}) updated successfully.`
        : `New profile for ${payload.full_name} (${payload.employee_id}) created successfully.`,
    };
  } catch (err: any) {
    console.error("saveStaffProfileAction database error:", err);
    return { error: extractErrorMessage(err, "Failed to save profile") };
  }
}

export async function deleteStaffProfileAction(id: string): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
      // Find staff photo and delete it if hosted on website so unused pictures are removed
      const { data: existing } = await privClient
        .from("staff_profiles")
        .select("photo_url")
        .eq("id", id)
        .single();
      if (existing?.photo_url) {
        await deleteUploadedFile(existing.photo_url);
      }

      const { error } = await privClient.from("staff_profiles").delete().eq("id", id);
      if (error) throw error;
    }

    revalidatePath("/admin/staff");
    revalidatePath("/admin/staff/list");
    revalidatePath("/admin/staff/profiles");
    revalidatePath("/about/teachers");
    revalidatePath("/about/staff");

    return { success: true, message: "Staff profile deleted successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to delete profile") };
  }
}

export async function toggleStaffStatusAction(
  id: string,
  newStatus: "active" | "on_leave" | "suspended" | "retired"
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    const parsed = staffStatusSchema.safeParse({ staff_id: id, status: newStatus });
    if (!parsed.success) {
      return { error: "Invalid status value" };
    }

    const privClient = privateAdmin();
    if (privClient) {
      const { error } = await privClient
        .from("staff_profiles")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    }

    revalidatePath("/admin/staff");
    revalidatePath("/admin/staff/list");
    revalidatePath("/admin/staff/profiles");

    return { success: true, message: `Status updated to ${newStatus}.` };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to update status") };
  }
}

export async function saveStaffAssignmentsAction(
  _prevState: StaffFeedback,
  formData: FormData
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    const staff_id = formData.get("staff_id") as string;
    const department = formData.get("department") as string;
    const is_head_of_department = formData.get("is_head_of_department") === "true";
    const is_class_teacher = formData.get("is_class_teacher") === "true";
    const class_teacher_section = (formData.get("class_teacher_section") as string) || undefined;
    const weekly_periods = Number(formData.get("weekly_periods") || 0);

    const assignedSubjectsRaw = formData.get("assigned_subjects") as string;
    const assignedClassesRaw = formData.get("assigned_classes") as string;

    const assigned_subjects = assignedSubjectsRaw
      ? assignedSubjectsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const assigned_classes = assignedClassesRaw
      ? assignedClassesRaw
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const parsed = staffAssignmentSchema.safeParse({
      staff_id,
      department,
      is_head_of_department,
      is_class_teacher,
      class_teacher_section,
      weekly_periods,
      assigned_subjects,
      assigned_classes,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Validation error" };
    }

    const privClient = privateAdmin();
    if (privClient) {
      const { error } = await privClient
        .from("staff_profiles")
        .update({
          department,
          is_head_of_department,
          is_class_teacher,
          class_teacher_section,
          weekly_periods,
          assigned_subjects,
          assigned_classes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staff_id);
      if (error) throw error;
    }

    revalidatePath("/admin/staff");
    revalidatePath("/admin/staff/departments");
    revalidatePath("/admin/staff/subjects");
    revalidatePath("/admin/staff/class-section");
    revalidatePath("/admin/staff/workload");

    return { success: true, message: "Assignments saved successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to save assignments") };
  }
}

export async function adminResetTeacherPasswordAction(
  staffId: string,
  newPassword: string
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    const privClient = privateAdmin();
    if (privClient) {
      const { error } = await privClient
        .from("staff_profiles")
        .update({
          portal_password: newPassword,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staffId);

      if (error) {
        console.warn("Could not update portal_password in staff_profiles:", error.message);
      }
    }

    revalidatePath("/admin/staff/accounts");
    revalidatePath("/admin/staff");

    return { success: true, message: "Teacher portal password updated successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to reset teacher password") };
  }
}

export async function assignSectionSubjectAction(
  teacherId: string,
  sectionCode: string,
  subjectName: string
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);
    const privClient = privateAdmin();
    if (!privClient) return { error: "Database not connected" };

    const { data: teacher, error: fetchErr } = await privClient
      .from("staff_profiles")
      .select("assigned_subjects, assigned_classes")
      .eq("id", teacherId)
      .single();

    if (fetchErr || !teacher) return { error: "Teacher not found" };

    const existingSubjects: string[] = teacher.assigned_subjects || [];
    const existingClasses: string[] = teacher.assigned_classes || [];

    const updatedSubjects = Array.from(new Set([...existingSubjects, subjectName.trim()])).filter(Boolean);
    const updatedClasses = Array.from(new Set([...existingClasses, sectionCode.trim()])).filter(Boolean);

    const { error } = await privClient
      .from("staff_profiles")
      .update({
        assigned_subjects: updatedSubjects,
        assigned_classes: updatedClasses,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teacherId);

    if (error) throw error;

    revalidatePath("/admin/staff/class-section");
    revalidatePath("/admin/staff/subjects");
    return { success: true, message: `Assigned ${subjectName} in ${sectionCode} successfully.` };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to assign subject") };
  }
}

export async function removeSectionSubjectAction(
  teacherId: string,
  sectionCode: string,
  subjectName: string
): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);
    const privClient = privateAdmin();
    if (!privClient) return { error: "Database not connected" };

    const { data: teacher, error: fetchErr } = await privClient
      .from("staff_profiles")
      .select("assigned_subjects, assigned_classes")
      .eq("id", teacherId)
      .single();

    if (fetchErr || !teacher) return { error: "Teacher not found" };

    const updatedSubjects = (teacher.assigned_subjects || []).filter(
      (s: string) => s.toLowerCase() !== subjectName.toLowerCase()
    );

    const { error } = await privClient
      .from("staff_profiles")
      .update({
        assigned_subjects: updatedSubjects,
        updated_at: new Date().toISOString(),
      })
      .eq("id", teacherId);

    if (error) throw error;

    revalidatePath("/admin/staff/class-section");
    revalidatePath("/admin/staff/subjects");
    return { success: true, message: `Removed ${subjectName} from teacher assignment.` };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to remove subject") };
  }
}
