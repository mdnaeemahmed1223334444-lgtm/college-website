export interface AttendanceTimeSettings {
  entry_time: string;             // "09:00"
  entry_grace_minutes: number;    // 15
  exit_time_default: string;      // "13:30"
  exit_early_threshold_minutes: number; // 15
  weekly_off_days: string[];      // ["Friday","Saturday"]
}

export interface ClassRoutineRecord {
  id: string;
  batch_id: string | null;
  study_group: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  teacher_name: string | null;
  room_number: string | null;
  is_physical_training: boolean;
  is_published: boolean;
  sort_order: number;
  color: string | null;
  created_at: string;
}
