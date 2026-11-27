import { privateAdmin } from "@/lib/supabase/private-server";
import type { AttendanceTimeSettings } from "./types";

export const DEFAULT_ATTENDANCE_TIME_SETTINGS: AttendanceTimeSettings = {
  entry_time: "09:00",
  entry_grace_minutes: 15,
  exit_time_default: "13:30",
  exit_early_threshold_minutes: 15,
  weekly_off_days: ["Friday", "Saturday"],
};

export async function getAttendanceTimeSettings(): Promise<AttendanceTimeSettings> {
  const supabase = privateAdmin();
  if (!supabase) return DEFAULT_ATTENDANCE_TIME_SETTINGS;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "attendance_time_settings")
      .maybeSingle();
    if (data?.value) {
      return { ...DEFAULT_ATTENDANCE_TIME_SETTINGS, ...JSON.parse(data.value) };
    }
    return DEFAULT_ATTENDANCE_TIME_SETTINGS;
  } catch {
    return DEFAULT_ATTENDANCE_TIME_SETTINGS;
  }
}
