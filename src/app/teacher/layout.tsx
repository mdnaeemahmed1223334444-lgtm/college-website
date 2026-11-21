import PortalShell from "@/components/layout/PortalShell";
import { requireRole } from "@/lib/auth/current-user";
import { teacherNav } from "@/config/navigation/teacher";

// Only the "teacher" role may enter. (middleware.ts is the first check, this is the second.)
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["teacher"]);
  return (
    <PortalShell title="Teacher Portal" nav={teacherNav} userName={user.fullName}>
      {children}
    </PortalShell>
  );
}
