"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { privateAdmin } from "@/lib/supabase/private-server";
import { staffProfileSchema, staffAssignmentSchema, staffStatusSchema } from "./schema";
import type { StaffFeedback } from "./types";

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

    const parsed = staffProfileSchema.safeParse({
      id,
      employee_id,
      full_name: formData.get("full_name"),
      bangla_name: formData.get("bangla_name") || undefined,
      role: rawRole || "teacher",
      designation: formData.get("designation"),
      department: formData.get("department"),
      email: formData.get("email") || "",
      phone: formData.get("phone"),
      gender: formData.get("gender") || "male",
      blood_group: formData.get("blood_group") || "A+",
      date_of_birth: formData.get("date_of_birth") || undefined,
      nid: formData.get("nid") || undefined,
      present_address: formData.get("present_address") || undefined,
      permanent_address: formData.get("permanent_address") || undefined,
      highest_degree: formData.get("highest_degree"),
      institution: formData.get("institution") || undefined,
      specialization: formData.get("specialization") || undefined,
      experience_years: formData.get("experience_years") || 0,
      joining_date: formData.get("joining_date") || new Date().toISOString().split("T")[0],
      employment_type: formData.get("employment_type") || "permanent",
      status: formData.get("status") || "active",
      photo_url: formData.get("photo_url") || undefined,
      bio: formData.get("bio") || undefined,
      room_number: formData.get("room_number") || undefined,
      is_head_of_department: formData.get("is_head_of_department") === "true" || formData.get("is_head_of_department") === "on",
      is_class_teacher: formData.get("is_class_teacher") === "true" || formData.get("is_class_teacher") === "on",
      class_teacher_section: formData.get("class_teacher_section") || undefined,
      weekly_periods: formData.get("weekly_periods") || 0,
      assigned_subjects,
      assigned_classes,
      display_order: formData.get("display_order") || 0,
      show_on_website: formData.get("show_on_website") !== "false",
    });

    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message || "Validation failed";
      return { error: err };
    }

    const payload = parsed.data;
    const privClient = privateAdmin();

    if (privClient) {
      if (id) {
        const { error } = await privClient
          .from("staff_profiles")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) throw error;
      } else {
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save profile";
    return { error: msg };
  }
}

export async function deleteStaffProfileAction(id: string): Promise<StaffFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
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
    const msg = err instanceof Error ? err.message : "Failed to delete profile";
    return { error: msg };
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
    const msg = err instanceof Error ? err.message : "Failed to update status";
    return { error: msg };
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
    const msg = err instanceof Error ? err.message : "Failed to save assignments";
    return { error: msg };
  }
}
