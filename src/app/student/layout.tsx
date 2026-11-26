import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { studentLogoutAction } from "@/features/students/auth-actions";
import { studentNav } from "@/config/navigation/student";
import PortalShell from "@/components/layout/PortalShell";

// Student portal is protected via custom cookie session (HMAC-signed, 30 days).
// This runs on every /student/* request (except /student/login which bypasses middleware).
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await getAuthenticatedStudent();
  if (!student) {
    redirect("/student/login");
  }
  return (
    <PortalShell
      title="Student Portal"
      nav={studentNav}
      userName={student.full_name}
      logoutAction={studentLogoutAction}
    >
      {children}
    </PortalShell>
  );
}
