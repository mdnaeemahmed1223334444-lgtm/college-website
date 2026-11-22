import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentById, getBatches } from "@/features/students/queries";
import StudentForm from "@/components/admin/students/StudentForm";

interface Props {
  params: Promise<{ studentId: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
  const { studentId } = await params;
  const [student, batches] = await Promise.all([
    getStudentById(studentId),
    getBatches(),
  ]);

  if (!student) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">
          Student Management
        </Link>
        <span>&rsaquo;</span>
        <Link href="/admin/students/list" className="hover:underline">
          Directory
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">{student.full_name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Edit Student Profile: {student.full_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            Student Code: {student.student_code} • Roll #{student.roll} • {student.batch_name}
          </p>
        </div>

        <Link
          href="/admin/students/list"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs self-start"
        >
          ← Back to Directory
        </Link>
      </div>

      <StudentForm initialData={student} batches={batches} />
    </div>
  );
}
