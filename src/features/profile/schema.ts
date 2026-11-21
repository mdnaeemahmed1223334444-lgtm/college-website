import { z } from "zod";

// null-safe: formData.get() returns null for missing/empty fields
const str = (min: number, msg: string) =>
  z.preprocess((v) => v ?? "", z.string().trim().min(min, msg));
const strOpt = z.preprocess((v) => (!v ? undefined : String(v).trim()), z.string().trim().optional());

export const updateStudentProfileSchema = z.object({
  phone: str(6, "Valid phone number is required"),
  email: z.preprocess((v) => v ?? "", z.string().trim().email("Valid email address is required")),
  address: str(3, "Present address is required"),
  guardianPhone: str(6, "Valid guardian phone number is required"),
});

export const updateTeacherProfileSchema = z.object({
  phone: str(6, "Valid phone number is required"),
  email: z.preprocess((v) => v ?? "", z.string().trim().email("Valid email address is required")),
  roomNumber: strOpt,
  address: strOpt,
  specialization: strOpt,
  bio: z.preprocess(
    (v) => (!v ? undefined : String(v).trim()),
    z.string().trim().max(1000, "Bio should not exceed 1000 characters").optional()
  ),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.preprocess((v) => v ?? "", z.string().min(1, "Current password is required")),
    newPassword: z.preprocess((v) => v ?? "", z.string().min(6, "New password must be at least 6 characters")),
    confirmPassword: z.preprocess((v) => v ?? "", z.string().min(1, "Please confirm your new password")),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });
