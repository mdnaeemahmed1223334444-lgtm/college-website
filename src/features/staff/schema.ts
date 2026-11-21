import { z } from "zod";

// null-safe helpers: formData.get() returns null for missing fields,
// which Zod z.string() rejects. preprocess converts null → "" or undefined.
const str = (min: number, msg: string) =>
  z.preprocess((v) => v ?? "", z.string().trim().min(min, msg));
const strOpt = z.preprocess((v) => (!v ? undefined : String(v).trim()), z.string().trim().optional());
const strEnum = <T extends string>(values: readonly [T, ...T[]], fallback: T) =>
  z.preprocess((v) => v || fallback, z.enum(values).default(fallback));

export const staffProfileSchema = z.object({
  id: z.string().optional(),
  employee_id: strOpt,
  full_name: str(2, "Full name must be at least 2 characters"),
  bangla_name: strOpt,
  role: strEnum(["teacher", "staff"] as const, "teacher"),
  designation: str(2, "Designation is required"),
  department: str(2, "Department is required"),
  email: z.preprocess((v) => v ?? "", z.string().email("Valid email required").or(z.literal(""))),
  phone: str(6, "Valid phone number is required"),
  gender: strEnum(["male", "female", "other"] as const, "male"),
  blood_group: z.preprocess((v) => v || "A+", z.string().default("A+")),
  date_of_birth: strOpt,
  nid: strOpt,
  present_address: strOpt,
  permanent_address: strOpt,
  highest_degree: str(2, "Highest degree is required"),
  institution: strOpt,
  specialization: strOpt,
  experience_years: z.coerce.number().min(0).default(0),
  joining_date: str(4, "Joining date is required"),
  employment_type: strEnum(["permanent", "contractual", "part_time", "guest"] as const, "permanent"),
  status: strEnum(["active", "on_leave", "suspended", "retired"] as const, "active"),
  photo_url: strOpt,
  bio: strOpt,
  room_number: strOpt,
  is_head_of_department: z.boolean().default(false),
  is_class_teacher: z.boolean().default(false),
  class_teacher_section: strOpt,
  weekly_periods: z.coerce.number().min(0).default(0),
  assigned_subjects: z.array(z.string()).default([]),
  assigned_classes: z.array(z.string()).default([]),
  display_order: z.coerce.number().default(0),
  show_on_website: z.boolean().default(true),
});

export const staffAssignmentSchema = z.object({
  staff_id: z.string().min(1, "Staff ID required"),
  department: z.string().min(2, "Department required"),
  is_head_of_department: z.boolean().default(false),
  is_class_teacher: z.boolean().default(false),
  class_teacher_section: z.string().optional(),
  weekly_periods: z.coerce.number().min(0).default(0),
  assigned_subjects: z.array(z.string()).default([]),
  assigned_classes: z.array(z.string()).default([]),
});

export const staffStatusSchema = z.object({
  staff_id: z.string().min(1),
  status: z.enum(["active", "on_leave", "suspended", "retired"]),
});

export const staffAttendanceSchema = z.object({
  staff_id: z.string().min(1),
  date: z.string().min(10),
  status: z.enum(["present", "absent", "late", "leave"]),
  in_time: z.string().optional(),
  out_time: z.string().optional(),
  remarks: z.string().optional(),
});
