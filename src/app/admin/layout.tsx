import PortalShell from "@/components/layout/PortalShell";
import { requireRole } from "@/lib/auth/current-user";
import { adminNav } from "@/config/navigation/admin";

// Only the "admin" role may enter. (middleware.ts is the first check, this is the second.)
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["admin"]);
  return (
    <PortalShell title="Administration System" nav={adminNav} userName={user.fullName}>
      {children}
    </PortalShell>
  );
}
