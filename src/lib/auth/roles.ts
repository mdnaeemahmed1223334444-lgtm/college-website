import type { Role } from "@/types/roles";

// Safe to import anywhere (including middleware): plain constants only.
export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

/** First URL segment -> the only role allowed inside that area. */
export const AREA_ROLE: Record<string, Role> = {
  admin: "admin",
  teacher: "teacher",
  student: "student",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role];
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};
