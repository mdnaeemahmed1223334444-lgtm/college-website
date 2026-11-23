export type AttendanceStatus = "present" | "late" | "absent" | "leave";

export interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  student_code: string;
  student_name: string;
  batch_name?: string;
  study_group?: string;
  roll?: number;
  date: string;
  in_time: string;
  out_time?: string;
  status: AttendanceStatus;
  rfid_card_id: string;
  device_id: string;
  scan_timestamp: string;
  remarks?: string;
}

export interface AttendanceStats {
  date: string;
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
