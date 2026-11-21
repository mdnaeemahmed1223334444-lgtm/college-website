import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  phone: z.string().trim().min(6, "Valid phone number is required"),
  email: z.string().trim().email("Valid email address is required"),
  address: z.string().trim().min(3, "Present address is required"),
  guardianPhone: z.string().trim().min(6, "Valid guardian phone number is required"),
});

export const updateTeacherProfileSchema = z.object({
  phone: z.string().trim().min(6, "Valid phone number is required"),
  email: z.string().trim().email("Valid email address is required"),
  roomNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  specialization: z.string().trim().optional(),
  bio: z.string().trim().max(1000, "Bio should not exceed 1000 characters").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });
