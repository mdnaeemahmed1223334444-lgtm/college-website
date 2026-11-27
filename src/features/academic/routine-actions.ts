"use server";
import { revalidatePath } from "next/cache";
import { privateAdmin } from "@/lib/supabase/private-server";

export async function saveClassRoutineAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };

  const id = formData.get("id") as string | null;
  const batch_id = (formData.get("batch_id") as string) || null;
  const study_group = (formData.get("study_group") as string) || null;
  const day_of_week = formData.get("day_of_week") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const subject = (formData.get("subject") as string)?.trim();
  const teacher_name = (formData.get("teacher_name") as string) || null;
  const is_physical_training = formData.get("is_physical_training") === "true";
  const is_published = formData.get("is_published") === "true";
  const color = (formData.get("color") as string) || null;

  if (!day_of_week || !start_time || !end_time || !subject) {
    return { error: "Day, start time, end time, and subject are required." };
  }

  const payload = {
    batch_id,
    study_group,
    day_of_week,
    start_time,
    end_time,
    subject,
    teacher_name,
    is_physical_training,
    is_published,
    color,
  };

  try {
    if (id) {
      const { error } = await supabase.from("class_routines").update(payload).eq("id", id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("class_routines").insert(payload);
      if (error) return { error: error.message };
    }
    revalidatePath("/admin/academic/routines");
    revalidatePath("/student/class-routine");
    revalidatePath("/student/dashboard");
    revalidatePath("/teacher/routines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}

export async function saveFullRoutineGridAction(
  batch_id: string | null,
  study_group: string | null,
  items: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: string;
    teacher_name?: string | null;
    is_physical_training?: boolean;
    color?: string | null;
    sort_order?: number;
  }>,
  is_published: boolean = true
): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };

  try {
    // 1. Delete existing routine records for this batch and group
    let deleteQuery = supabase.from("class_routines").delete();
    if (batch_id) {
      deleteQuery = deleteQuery.eq("batch_id", batch_id);
    } else {
      deleteQuery = deleteQuery.is("batch_id", null);
    }
    if (study_group) {
      deleteQuery = deleteQuery.eq("study_group", study_group);
    } else {
      deleteQuery = deleteQuery.is("study_group", null);
    }
    await deleteQuery;

    // 2. Filter valid items and insert
    const validItems = items
      .filter((it) => it.subject && it.subject.trim().length > 0)
      .map((it, idx) => ({
        batch_id: batch_id || null,
        study_group: study_group || null,
        day_of_week: it.day_of_week,
        start_time: it.start_time,
        end_time: it.end_time,
        subject: it.subject.trim(),
        teacher_name: it.teacher_name || null,
        is_physical_training: Boolean(it.is_physical_training),
        is_published,
        sort_order: it.sort_order ?? idx,
        color: it.color || null,
      }));

    if (validItems.length > 0) {
      const { error: insertErr } = await supabase.from("class_routines").insert(validItems);
      if (insertErr) return { error: insertErr.message };
    }

    revalidatePath("/admin/academic/routines");
    revalidatePath("/student/class-routine");
    revalidatePath("/student/dashboard");
    revalidatePath("/teacher/routines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save routine grid" };
  }
}

export async function deleteClassRoutineAction(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };
  try {
    const { error } = await supabase.from("class_routines").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/academic/routines");
    revalidatePath("/student/class-routine");
    revalidatePath("/student/dashboard");
    revalidatePath("/teacher/routines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}

export async function publishRoutineGroupAction(
  batch_id: string | null,
  study_group: string | null,
  is_published: boolean
): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };
  try {
    let query = supabase.from("class_routines").update({ is_published });
    if (batch_id) query = query.eq("batch_id", batch_id);
    if (study_group) query = query.eq("study_group", study_group);
    const { error } = await query;
    if (error) return { error: error.message };
    revalidatePath("/admin/academic/routines");
    revalidatePath("/student/class-routine");
    revalidatePath("/student/dashboard");
    revalidatePath("/teacher/routines");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
