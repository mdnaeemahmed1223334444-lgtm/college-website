import { redirect } from "next/navigation";

// Redirect root /student to the student dashboard
export default function StudentRootPage() {
  redirect("/student/dashboard");
}
