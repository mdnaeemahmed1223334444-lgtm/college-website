"use server";
import { revalidatePath } from "next/cache";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { AttendanceTimeSettings } from "./types";
import { getAttendanceTimeSettings } from "./attendance-settings-queries";

export { getAttendanceTimeSettings };

export async function saveAttendanceTimeSettingsAction(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = privateAdmin();
  if (!supabase) return { error: "Database connection failed" };

  const entry_time = (formData.get("entry_time") as string) || "09:00";
  const entry_grace_minutes = parseInt(formData.get("entry_grace_minutes") as string, 10) || 15;
  const exit_time_default = (formData.get("exit_time_default") as string) || "13:30";
  const exit_early_threshold_minutes = parseInt(formData.get("exit_early_threshold_minutes") as string, 10) || 15;

  const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekly_off_days = allDays.filter((d) => formData.get(`off_${d}`) === "on");

  const settings: AttendanceTimeSettings = {
    entry_time,
    entry_grace_minutes,
    exit_time_default,
    exit_early_threshold_minutes,
    weekly_off_days,
  };

  try {
    const { error } = await supabase.from("site_settings").upsert(
      { key: "attendance_time_settings", value: JSON.stringify(settings) },
      { onConflict: "key" }
    );
    if (error) return { error: error.message };
    revalidatePath("/admin/attendance/rules");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Unknown error" };
  }
}
