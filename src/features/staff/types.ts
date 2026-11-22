export type StaffRole = "teacher" | "staff";

export type StaffDepartment =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Biology"
  | "Bangla"
  | "English"
  | "Information & Communication Technology"
  | "Accounting"
  | "Business Organization & Management"
  | "Finance & Banking"
  | "Economics"
  | "Civics & Good Governance"
  | "Sociology"
  | "History & Islamic History"
  | "Administration"
  | "Library"
  | "Accounts & Finance"
  | "IT & Media"
  | "General Office";

export type EmploymentType = "permanent" | "contractual" | "part_time" | "guest";
export type StaffStatus = "active" | "on_leave" | "suspended" | "retired";

export interface StaffProfileRecord {
  id: string;
  employee_id: string; // e.g. "T-101", "S-201"
  full_name: string;
  bangla_name?: string;
  role: StaffRole; // "teacher" | "staff"
  designation: string; // e.g. "Associate Professor", "Lecturer", "Senior Accountant"
  department: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  blood_group: string;
  religion?: string | null;
  date_of_birth?: string;
  nid?: string;
  present_address?: string;
  permanent_address?: string;
  highest_degree: string; // e.g. "M.Sc in Physics (DU)"
  institution?: string; // e.g. "University of Dhaka"
  specialization?: string; // e.g. "Quantum Electronics"
  experience_years?: number;
  joining_date: string;
  employment_type: EmploymentType;
  status: StaffStatus;
  photo_url?: string;
  bio?: string;
  room_number?: string;
  is_head_of_department?: boolean;
  is_class_teacher?: boolean;
  class_teacher_section?: string; // e.g. "XI Science A"
  weekly_periods?: number;
  assigned_subjects?: string[];
  assigned_classes?: string[];
  display_order?: number;
  show_on_website?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffFeedback {
  success?: boolean;
  message?: string;
  error?: string;
  staffId?: string;
}

export interface StaffFilter {
  role?: string;
  department?: string;
  status?: string;
  search?: string;
}

export interface StaffStats {
  totalStaff: number;
  totalTeachers: number;
  totalSupportStaff: number;
  activeCount: number;
  onLeaveCount: number;
  departmentCount: number;
  avgWeeklyPeriods: number;
}

export interface StaffAttendanceRecord {
  id: string;
  staff_id: string;
  employee_id: string;
  full_name: string;
  role: StaffRole;
  department: string;
  date: string; // YYYY-MM-DD
  in_time?: string;
  out_time?: string;
  status: "present" | "absent" | "late" | "leave";
  remarks?: string;
}
