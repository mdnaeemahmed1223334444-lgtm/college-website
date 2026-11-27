"use server";
import { revalidatePath } from "next/cache";
import { privateAdmin } from "@/lib/supabase/private-server";
import { computeGrade } from "./types";

export async function saveExamResultAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };

  const id = formData.get("id") as string | null;
  const student_id = formData.get("student_id") as string;
  const batch_id = formData.get("batch_id") as string | null;
  const exam_name = (formData.get("exam_name") as string)?.trim();
  const subject = (formData.get("subject") as string)?.trim();
  const total_marks = parseFloat(formData.get("total_marks") as string) || 100;
  const obtained_marks_raw = formData.get("obtained_marks") as string;
  const obtained_marks = obtained_marks_raw ? parseFloat(obtained_marks_raw) : null;
  const exam_date = (formData.get("exam_date") as string) || null;
  const academic_year = (formData.get("academic_year") as string) || null;
  const remarks = (formData.get("remarks") as string) || null;
  const is_published = formData.get("is_published") === "true";
  const created_by = (formData.get("created_by") as string) || "admin";

  if (!student_id || !exam_name || !subject) {
    return { error: "Student, exam name, and subject are required." };
  }

  // Auto-compute grade and GPA
  let grade: string | null = (formData.get("grade") as string) || null;
  let gpa: number | null = formData.get("gpa") ? parseFloat(formData.get("gpa") as string) : null;
  if (obtained_marks !== null && !grade) {
    const computed = computeGrade(obtained_marks, total_marks);
    grade = computed.grade;
    gpa = computed.gpa;
  }

  const payload = {
    student_id,
    batch_id: batch_id || null,
    exam_name,
    subject,
    total_marks,
    obtained_marks,
    grade,
    gpa,
    exam_date: exam_date || null,
    academic_year: academic_year || null,
    remarks: remarks || null,
    is_published,
    created_by,
    updated_at: new Date().toISOString(),
  };

  try {
    if (id) {
      const { error } = await supabase.from("exam_results").update(payload).eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("exam_results").insert({ ...payload, created_at: new Date().toISOString() });
      if (error) return { error: error.message };
    }

    revalidatePath("/admin/examinations/marks");
    revalidatePath("/student/results");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}

export async function deleteExamResultAction(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };
  try {
    const { error } = await supabase.from("exam_results").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/examinations/marks");
    revalidatePath("/student/results");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}

export async function togglePublishResultAction(id: string, is_published: boolean): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };
  try {
    const { error } = await supabase.from("exam_results").update({ is_published, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/examinations/marks");
    revalidatePath("/student/results");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
