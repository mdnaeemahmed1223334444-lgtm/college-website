"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { privateAdmin } from "@/lib/supabase/private-server";
import {
  updateStudentProfileSchema,
  updateTeacherProfileSchema,
  changePasswordSchema,
} from "./schema";
import type { ProfileFeedback } from "./types";

export async function updateStudentProfileAction(
  _prev: ProfileFeedback,
  formData: FormData
): Promise<ProfileFeedback> {
  const user = await requireRole(["student"]);

  const parsed = updateStudentProfileSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    guardianPhone: formData.get("guardianPhone"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input data.",
    };
  }

  const supabase = privateAdmin();
  if (supabase && user.id && user.id !== "dev-user") {
    try {
      const { error } = await supabase
        .from("students")
        .update({
          phone: parsed.data.phone,
          email: parsed.data.email,
          address: parsed.data.address,
          guardian_phone: parsed.data.guardianPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", user.id);

      if (error) {
        return { success: false, error: `Failed to update profile: ${error.message}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile." };
    }
  }

  revalidatePath("/student/profile");
  return { success: true, message: "Contact information updated successfully!" };
}

export async function updateTeacherProfileAction(
  _prev: ProfileFeedback,
  formData: FormData
): Promise<ProfileFeedback> {
  const user = await requireRole(["teacher"]);

  const parsed = updateTeacherProfileSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    roomNumber: formData.get("roomNumber") || undefined,
    address: formData.get("address") || undefined,
    specialization: formData.get("specialization") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input data.",
    };
  }

  const supabase = privateAdmin();
  if (supabase && user.id && user.id !== "dev-user") {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          email: parsed.data.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: `Failed to update teacher profile: ${error.message}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to update profile." };
    }
  }

  revalidatePath("/teacher/profile");
  return { success: true, message: "Teacher profile details updated successfully!" };
}

export async function changePasswordAction(
  _prev: ProfileFeedback,
  formData: FormData
): Promise<ProfileFeedback> {
  const user = await requireRole(["student", "teacher", "admin"]);

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password data.",
    };
  }

  const supabase = privateAdmin();
  if (supabase && user.id && user.id !== "dev-user") {
    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: parsed.data.newPassword,
      });
      if (error) {
        return { success: false, error: `Could not change password: ${error.message}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to change password." };
    }
  }

  return { success: true, message: "Password changed successfully!" };
}
