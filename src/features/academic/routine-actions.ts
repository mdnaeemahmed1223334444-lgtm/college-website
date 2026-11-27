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
  const room_number = (formData.get("room_number") as string) || null;
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
    room_number,
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
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
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
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
