import Link from "next/link";
import { notFound } from "next/navigation";
import { getBatches, getStudents } from "@/features/students/queries";
import StudentListManager from "@/components/admin/students/StudentListManager";

interface Props {
  params: Promise<{ batchId: string }>;
}

export default async function AdminBatchDetailPage({ params }: Props) {
  const { batchId } = await params;
  const batches = await getBatches();
  const batch = batches.find(
    (b) => b.id.toLowerCase() === batchId.toLowerCase() || b.name.toLowerCase() === batchId.toLowerCase()
  );

  if (!batch) {
    notFound();
  }

  // Fetch only students belonging to this batch
  const allStudents = await getStudents({ batchId: batch.id });
  const batchStudents = allStudents.filter(
    (s) =>
      s.batch_id === batch.id ||
      s.batch_name?.toLowerCase() === batch.name.toLowerCase() ||
      s.batch_id.toLowerCase() === batch.name.toLowerCase()
  );

  const scienceCount = batchStudents.filter((s) => s.study_group === "science").length;
  const businessCount = batchStudents.filter((s) => s.study_group === "business_studies").length;
  const humanitiesCount = batchStudents.filter((s) => s.study_group === "humanities").length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">
          Student Management
        </Link>
        <span>&rsaquo;</span>
        <Link href="/admin/students/batches" className="hover:underline">
          Batches
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">{batch.name}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{batch.name}</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                batch.status === "running"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-indigo-100 text-indigo-800"
              }`}
            >
              {batch.status === "running" ? "● Running" : "● Alumni (Passed)"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            Exam Year: {batch.exam_year} • Academic Level:{" "}
            {batch.status === "passed"
              ? "Completed / Alumni"
              : batch.current_year === "second_year"
              ? "2nd Year (Class XII)"
              : "1st Year (Class XI)"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/students/batches"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            ← All Batches
          </Link>
        </div>
      </div>

      {/* Stats Cards for This Batch */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Total in {batch.name}</div>
          <div className="mt-1 text-2xl font-extrabold text-gray-900">{batchStudents.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Enrolled students</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Science</div>
          <div className="mt-1 text-2xl font-extrabold text-blue-600">{scienceCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Students</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Business Studies</div>
          <div className="mt-1 text-2xl font-extrabold text-purple-600">{businessCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Students</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Humanities</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600">{humanitiesCount}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Students</div>
        </div>
      </div>

      {/* Students in this Batch */}
      <StudentListManager
        initialStudents={batchStudents}
        batches={[batch]}
        initialBatchId={batch.id}
      />
    </div>
  );
}
