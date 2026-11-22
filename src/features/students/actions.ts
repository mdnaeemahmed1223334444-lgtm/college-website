"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { privateAdmin } from "@/lib/supabase/private-server";
import { deleteUploadedFile } from "@/lib/storage/uploader";
import { studentSchema, batchSchema } from "./schema";
import type { StudentFeedback } from "./types";

function extractErrorMessage(err: any, fallback: string): string {
  const msg =
    err?.message ||
    err?.error_description ||
    (err instanceof Error ? err.message : typeof err === "string" ? err : fallback);
  const hint = err?.hint ? ` (Hint: ${err.hint})` : err?.details ? ` (${err.details})` : "";
  return `${msg}${hint}`;
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

export async function saveStudentAction(
  _prevState: StudentFeedback,
  formData: FormData
): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const id = (formData.get("id") as string) || undefined;
    const currentYear = new Date().getFullYear();
    let student_code = (formData.get("student_code") as string)?.trim();
    if (!student_code) {
      student_code = `STU-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const str = (key: string): string => (formData.get(key) as string) ?? "";
    const opt = (key: string): string | undefined => (formData.get(key) as string) || undefined;

    const parsed = studentSchema.safeParse({
      id,
      student_code,
      full_name: str("full_name"),
      bangla_name: opt("bangla_name"),
      batch_id: str("batch_id"),
      study_group: str("study_group") || "science",
      roll: formData.get("roll") || 1,
      section: opt("section"),
      status: str("status") || "active",
      gender: str("gender") || "male",
      date_of_birth: normalizeOptionalDate(opt("date_of_birth")),
      blood_group: opt("blood_group"),
      phone: opt("phone"),
      email: opt("email"),
      address: opt("address"),
      permanent_address: opt("permanent_address"),
      father_name: opt("father_name"),
      father_phone: opt("father_phone"),
      mother_name: opt("mother_name"),
      mother_phone: opt("mother_phone"),
      guardian_name: opt("guardian_name"),
      guardian_phone: opt("guardian_phone"),
      guardian_relation: opt("guardian_relation"),
      photo_url: opt("photo_url"),
      rfid_card_id: opt("rfid_card_id"),
      notes: opt("notes"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const payload: Record<string, any> = {
      ...parsed.data,
      photo_key: parsed.data.photo_url || null, // Keep photo_key synced with photo_url
    };

    const privClient = privateAdmin();

    if (privClient) {
      if (id) {
        // Automatic cleanup of old unused student photo
        const { data: existing } = await privClient
          .from("students")
          .select("photo_url, photo_key")
          .eq("id", id)
          .single();

        const oldPhoto = existing?.photo_url || existing?.photo_key;
        if (oldPhoto && oldPhoto !== payload.photo_url) {
          await deleteUploadedFile(oldPhoto);
        }

        const { error } = await privClient
          .from("students")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        // Remove undefined/null id so PostgreSQL uses default gen_random_uuid()
        delete payload.id;

        const { error } = await privClient.from("students").insert({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/list");
    revalidatePath("/admin/students/batches");
    revalidatePath("/student/profile");

    return {
      success: true,
      message: id
        ? `Student record for ${payload.full_name} (${payload.student_code}) updated successfully.`
        : `New student ${payload.full_name} (${payload.student_code}) enrolled successfully.`,
    };
  } catch (err: any) {
    console.error("saveStudentAction database error:", err);
    return { error: extractErrorMessage(err, "Failed to save student profile") };
  }
}

export async function deleteStudentAction(id: string): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
      // Find student photo and delete it if hosted on website so unused pictures are removed
      const { data: existing } = await privClient
        .from("students")
        .select("photo_url, photo_key")
        .eq("id", id)
        .single();

      const photo = existing?.photo_url || existing?.photo_key;
      if (photo) {
        await deleteUploadedFile(photo);
      }

      const { error } = await privClient.from("students").delete().eq("id", id);
      if (error) throw error;
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/list");
    revalidatePath("/admin/students/batches");
    revalidatePath("/student/profile");

    return { success: true, message: "Student record deleted successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to delete student record") };
  }
}

export async function toggleStudentStatusAction(
  id: string,
  newStatus: "active" | "suspended" | "dropped" | "passed_out"
): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
      const { error } = await privClient
        .from("students")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/list");

    return { success: true, message: `Status updated to ${newStatus}.` };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to update status") };
  }
}

export async function saveBatchAction(
  _prevState: StudentFeedback,
  formData: FormData
): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const id = (formData.get("id") as string) || undefined;
    const parsed = batchSchema.safeParse({
      id,
      name: formData.get("name"),
      exam_year: formData.get("exam_year"),
      status: formData.get("status") || "running",
      current_year: formData.get("current_year") || "first_year",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Validation failed" };
    }

    const privClient = privateAdmin();
    if (privClient) {
      const payload: Record<string, any> = { ...parsed.data };
      if (id) {
        const { error } = await privClient
          .from("batches")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
      } else {
        delete payload.id;
        const { error } = await privClient.from("batches").insert({
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/batches");
    revalidatePath("/admin/students/list");

    return { success: true, message: "Batch saved successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to save batch") };
  }
}

export async function deleteBatchAction(id: string): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
      const { error } = await privClient.from("batches").delete().eq("id", id);
      if (error) throw error;
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/batches");
    revalidatePath("/admin/students/list");

    return { success: true, message: "Batch deleted successfully." };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to delete batch (check if students are attached)") };
  }
}

export async function updateBatchStatusAndStudentsAction(
  batchId: string,
  newBatchStatus: "running" | "passed",
  newStudentStatus: "active" | "passed_out" | "suspended" | "dropped",
  currentYear?: "first_year" | "second_year" | null
): Promise<StudentFeedback> {
  try {
    await requireRole(["admin"]);

    const privClient = privateAdmin();
    if (privClient) {
      // 1. Update the batch table
      const { error: batchErr } = await privClient
        .from("batches")
        .update({
          status: newBatchStatus,
          current_year: newBatchStatus === "running" ? currentYear || "second_year" : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      if (batchErr) throw batchErr;

      // 2. Bulk update all students belonging to this batch
      const { error: stuErr } = await privClient
        .from("students")
        .update({
          status: newStudentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("batch_id", batchId);

      if (stuErr) throw stuErr;
    }

    revalidatePath("/admin/students");
    revalidatePath("/admin/students/batches");
    revalidatePath("/admin/students/list");

    return {
      success: true,
      message: `Batch status updated to '${newBatchStatus}' and all enrolled students set to '${newStudentStatus}'.`,
    };
  } catch (err: unknown) {
    return { error: extractErrorMessage(err, "Failed to update batch status and students") };
  }
}
