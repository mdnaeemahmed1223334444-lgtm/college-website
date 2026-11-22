import Link from "next/link";
import { getBatches } from "@/features/students/queries";
import StudentForm from "@/components/admin/students/StudentForm";

export default async function AddStudentPage() {
  const batches = await getBatches();

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
        <span className="font-medium text-gray-900">Enroll New Student</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Enroll New Student</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete the profile details below. Student ID will be generated automatically if left blank.
          Photo uploads directly to Cloudflare storage without requiring external links.
        </p>
      </div>

      <StudentForm batches={batches} />
    </div>
  );
}
