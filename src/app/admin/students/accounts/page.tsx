import Link from "next/link";
import { getStudents, getBatches } from "@/features/students/queries";
import StudentAccountsManager from "@/components/admin/students/StudentAccountsManager";

export const metadata = {
  title: "Student Account Management | Admin",
  description: "Manage student portal credentials, password resets, and account activation.",
};

export default async function StudentAccountsPage() {
  const [students, batches] = await Promise.all([
    getStudents(),
    getBatches(),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">
          Student Management
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Student Accounts &amp; Credentials</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Student Account &amp; Credential Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign passwords, reset credentials, activate or suspend student portal access.
          </p>
        </div>

        <Link
          href="/admin/students"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs self-start"
        >
          ← Back to Student Hub
        </Link>
      </div>

      <StudentAccountsManager students={students} batches={batches} />
    </div>
  );
}
