import Link from "next/link";
import { getStudentStats, getStudents, getBatches } from "@/features/students/queries";

export default async function StudentsDashboardPage() {
  const stats = await getStudentStats();
  const students = await getStudents();
  const batches = await getBatches();
  const recentStudents = students.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Student directory, profile records, photo uploads, batch management, and hardware RFID readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/students/batches"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            Batches ({batches.length})
          </Link>
          <Link
            href="/admin/students/add"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Add New Student</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Total Enrolled</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{stats.totalStudents}</span>
            <span className="text-xs font-bold text-emerald-700">● {stats.activeStudents} Active</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">Across {batches.length} registered batches</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Science Stream</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-600">{stats.scienceCount}</span>
            <span className="text-xs text-gray-500">Students</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {stats.totalStudents > 0 ? Math.round((stats.scienceCount / stats.totalStudents) * 100) : 0}% of student body
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Business Studies</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600">{stats.businessCount}</span>
            <span className="text-xs text-gray-500">Students</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {stats.totalStudents > 0 ? Math.round((stats.businessCount / stats.totalStudents) * 100) : 0}% of student body
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-bold uppercase text-gray-400">Humanities Stream</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{stats.humanitiesCount}</span>
            <span className="text-xs text-gray-500">Students</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {stats.totalStudents > 0 ? Math.round((stats.humanitiesCount / stats.totalStudents) * 100) : 0}% of student body
          </div>
        </div>
      </div>

      {/* Hardware / ESP Device Notification Banner */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-blue-50/90 p-4 text-xs text-indigo-950 flex items-start gap-3">
        <span className="text-xl">📡</span>
        <div>
          <span className="font-bold">Hardware RFID Attendance Device Ready:</span> Each student profile has an optional RFID Tag UID field ready for your ESP hardware scanner. When your ESP scanner posts card scans to Supabase, it will match seamlessly with these student profiles.
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/students/list"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg mb-1">📋</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Student Directory</h3>
          <p className="text-xs text-gray-500 mt-1">
            Search, filter by stream or batch, edit profiles, and view full contact lists.
          </p>
        </Link>

        <Link
          href="/admin/students/add"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg mb-1">➕</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Add New Student</h3>
          <p className="text-xs text-gray-500 mt-1">
            Enroll a new student with direct photo upload and automatic student ID generation.
          </p>
        </Link>

        <Link
          href="/admin/students/batches"
          className="group rounded-xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-lg mb-1">🏫</div>
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600">Batch Management</h3>
          <p className="text-xs text-gray-500 mt-1">
            Manage exam-year batches, academic level transitions (1st Year / 2nd Year), and alumni.
          </p>
        </Link>
      </div>

      {/* Recent Students Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recently Enrolled Students</h2>
          <Link href="/admin/students/list" className="text-xs font-semibold text-blue-600 hover:underline">
            View All ({students.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-2.5">Student</th>
                <th className="px-3 py-2.5">Batch & Stream</th>
                <th className="px-3 py-2.5">Roll</th>
                <th className="px-3 py-2.5">Phone</th>
                <th className="px-3 py-2.5">Hardware RFID</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                        {s.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.photo_url} alt={s.full_name} className="h-full w-full object-cover" />
                        ) : (
                          s.full_name.charAt(0)
                        )}
                      </div>
                      <span>{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700">
                    {s.batch_name} — {s.study_group.replace("_", " ")}
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">#{s.roll}</td>
                  <td className="px-3 py-2.5 text-gray-600">{s.phone || "—"}</td>
                  <td className="px-3 py-2.5">
                    {s.rfid_card_id ? (
                      <span className="font-mono text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        {s.rfid_card_id}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={`/admin/students/${s.id}`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Profile →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
