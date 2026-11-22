import Link from "next/link";
import { getStudents, getBatches } from "@/features/students/queries";
import StudentListManager from "@/components/admin/students/StudentListManager";

interface Props {
  searchParams?: Promise<{ batch?: string; group?: string; status?: string; search?: string }>;
}

export default async function StudentListPage({ searchParams }: Props) {
  const params = await searchParams;
  const [students, batches] = await Promise.all([
    getStudents({
      batchId: params?.batch,
      group: params?.group as any,
      status: params?.status as any,
      search: params?.search,
    }),
    getBatches(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">
          Student Management
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Student Directory</span>
      </div>

      <StudentListManager
        initialStudents={students}
        batches={batches}
        initialBatchId={params?.batch}
      />
    </div>
  );
}
