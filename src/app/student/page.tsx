import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/features/students/auth";

// Direct entry to student area: redirect to dashboard if logged in, or to login if not
export default async function StudentRootPage() {
  const student = await getAuthenticatedStudent();
  if (!student) {
    redirect("/student/login");
  }
  redirect("/student/dashboard");
}
