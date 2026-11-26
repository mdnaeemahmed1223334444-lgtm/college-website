export type AttendanceStatus = "present" | "late" | "absent" | "leave";

export interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  batch_name?: string;
  study_group?: string;
  roll?: number;
  section?: string;
  date: string; // ISO format: YYYY-MM-DD
  formatted_date: string; // Bangladesh format: DD-MM-YYYY (e.g. 27-11-2026)
  day_of_week: string; // e.g. Friday, Monday
  in_time: string; // raw time
  formatted_time: string; // Bangladesh 12-hour format: 09:30 AM / 09:30 PM
  out_time?: string;
  formatted_out_time?: string;
  status: AttendanceStatus;
  rfid_card_id: string;
  device_id: string;
  scan_timestamp: string;
  remarks?: string;
}

export interface AttendanceStats {
  date: string;
  formatted_date: string;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  attendanceRate: number; // percentage
}

export interface GateDeviceRecord {
  id: string;
  device_id: string;
  name: string;
  location: string;
  is_active: boolean;
  last_seen_at?: string;
  status: "online" | "offline";
}

export interface StudentAttendanceSummary {
  student_id: string;
  student_code: string;
  student_name: string;
  total_class_days: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  leave_days: number;
  percentage: number;
  records: StudentAttendanceRecord[];
}

export interface AttendanceFilterOptions {
  date?: string; // 'all', 'today', 'yesterday', or 'YYYY-MM-DD'
  startDate?: string;
  endDate?: string;
  month?: string; // e.g. '2026-11'
  batchId?: string;
  studyGroup?: string;
  section?: string;
  status?: string;
  search?: string;
  studentId?: string;
  studentCode?: string;
  limit?: number;
}
