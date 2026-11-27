import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { studentLogoutAction } from "@/features/students/auth-actions";
import { studentNav } from "@/config/navigation/student";
import PortalShell from "@/components/layout/PortalShell";

// Student portal is protected via custom cookie session (HMAC-signed, 30 days).
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // If rendering the student login page, do NOT enforce auth or wrap with PortalShell
  if (pathname.includes("/student/login")) {
    return <>{children}</>;
  }

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
