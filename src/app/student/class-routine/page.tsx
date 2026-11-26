import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";

export const metadata = {
  title: "Class Routine | Student Portal",
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOrder: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

export default async function ClassRoutinePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  // Try to fetch class routine from DB for student's batch/group
  let routineRecords: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("class_routines")
        .select("*")
        .eq("is_published", true)
        .or(
          `batch_id.is.null,batch_id.eq.${student.batch_id}`
        )
        .order("day_of_week")
        .order("start_time");

      if (data && data.length > 0) {
        // Filter by study_group if specified
        routineRecords = data.filter(
          (r: any) => !r.study_group || r.study_group === student.study_group
        );
      }
    } catch {
      // Table may not exist yet — show helpful message
    }
  }

  // Group records by day
  const byDay = new Map<string, any[]>();
  for (const r of routineRecords) {
    if (!byDay.has(r.day_of_week)) byDay.set(r.day_of_week, []);
    byDay.get(r.day_of_week)!.push(r);
  }

  // Sort days
  const sortedDays = Array.from(byDay.keys()).sort(
    (a, b) => (dayOrder[a] ?? 99) - (dayOrder[b] ?? 99)
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Class Routine</h1>
          <p className="text-sm text-gray-500 mt-1">
            Weekly timetable for{" "}
            <strong>{student.batch_name}</strong>
            {student.study_group && (
              <> — {student.study_group.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</>
            )}
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {routineRecords.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-5xl mb-4">📅</p>
          <p className="text-lg font-bold text-gray-900">Class Routine Not Published Yet</p>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            Your class routine will appear here once the college administration publishes it.
            Please check back later or contact your class teacher.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <div key={day} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-blue-700 px-5 py-3">
                <h2 className="text-sm font-bold text-white">{day}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {byDay.get(day)!.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.subject}</td>
                        <td className="px-4 py-3 text-gray-600">{r.teacher_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{r.room_number || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
