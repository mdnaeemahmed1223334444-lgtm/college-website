import { z } from "zod";

export const staffProfileSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().trim().optional(),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  bangla_name: z.string().trim().optional(),
  role: z.enum(["teacher", "staff"]).default("teacher"),
  designation: z.string().min(2, "Designation is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Valid email required").or(z.literal("")),
  phone: z.string().min(6, "Valid phone number required"),
  gender: z.enum(["male", "female", "other"]).default("male"),
  blood_group: z.string().default("A+"),
  date_of_birth: z.string().optional(),
  nid: z.string().optional(),
  present_address: z.string().optional(),
  permanent_address: z.string().optional(),
  highest_degree: z.string().min(2, "Highest degree is required"),
  institution: z.string().optional(),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0).default(0),
  joining_date: z.string().min(4, "Joining date required"),
  employment_type: z.enum(["permanent", "contractual", "part_time", "guest"]).default("permanent"),
  status: z.enum(["active", "on_leave", "suspended", "retired"]).default("active"),
  photo_url: z.string().optional(),
  bio: z.string().optional(),
  room_number: z.string().optional(),
  is_head_of_department: z.boolean().default(false),
  is_class_teacher: z.boolean().default(false),
  class_teacher_section: z.string().optional(),
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
