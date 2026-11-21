import PortalShell from "@/components/layout/PortalShell";
import { requireRole } from "@/lib/auth/current-user";
import { studentNav } from "@/config/navigation/student";

// Only the "student" role may enter. (middleware.ts is the first check, this is the second.)
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["student"]);
  return (
    <PortalShell title="Student Portal" nav={studentNav} userName={user.fullName}>
      {children}
    </PortalShell>
  );
}
