import Link from "next/link";
import { requireRole } from "@/lib/auth/current-user";
import { getStudents, getBatches } from "@/features/students/queries";
import TeacherStudentDirectory from "@/components/teacher/TeacherStudentDirectory";

export const metadata = {
  title: "Student Information - Teacher Portal",
  description: "View enrolled student profiles, academic streams, and guardian contact details.",
};

export default async function TeacherStudentsPage() {
  await requireRole(["teacher", "admin"]);
  const [students, batches] = await Promise.all([
    getStudents(),
    getBatches(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/teacher" className="hover:underline">
          Teacher Portal
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Student Information</span>
      </div>

      <TeacherStudentDirectory initialStudents={students} batches={batches} />
    </div>
  );
}
