// Shared role types. Used by auth (Part 2) and all portals.
export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export type AccountStatus = "active" | "suspended";
