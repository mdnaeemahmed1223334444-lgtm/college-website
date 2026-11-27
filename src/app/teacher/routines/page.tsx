import { privateAdmin } from "@/lib/supabase/private-server";
import Link from "next/link";

export const metadata = {
  title: "Class Routines | Teacher Portal",
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOrder: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

export default async function TeacherRoutinesPage() {
  const supabase = privateAdmin();
  let routines: any[] = [];
  let batches: any[] = [];

  if (supabase) {
    try {
      const [rRes, bRes] = await Promise.all([
        supabase
          .from("class_routines")
          .select("*")
          .eq("is_published", true)
          .order("day_of_week")
          .order("start_time"),
        supabase.from("batches").select("id, name"),
      ]);
      routines = rRes.data || [];
      batches = bRes.data || [];
    } catch {
      // ignore
    }
  }

  const batchMap = new Map(batches.map((b: any) => [b.id, b.name]));

  const byDay = new Map<string, any[]>();
  for (const r of routines) {
    if (!byDay.has(r.day_of_week)) byDay.set(r.day_of_week, []);
    byDay.get(r.day_of_week)!.push(r);
  }

  const sortedDays = Array.from(byDay.keys()).sort(
    (a, b) => (dayOrder[a] ?? 99) - (dayOrder[b] ?? 99)
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Class Routines</h1>
        <p className="text-sm text-gray-500 mt-1">
          Master timetable across all academic batches and study groups.
        </p>
      </div>

      {routines.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-bold text-gray-900">No published class routines found</p>
          <p className="text-sm text-gray-500 mt-1">The administration has not published routines yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDays.map((day) => (
            <div key={day} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
              <div className="bg-blue-700 px-5 py-3">
                <h2 className="text-sm font-bold text-white">{day}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Batch</th>
                      <th className="px-4 py-3">Group</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {byDay.get(day)!.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {batchMap.get(r.batch_id) || "All Batches"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {r.study_group?.replace("_", " ") || "All Groups"}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {r.subject}
                          {r.is_physical_training && (
                            <span className="ml-2 rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 text-[9px] font-bold">🏃 PT</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.teacher_name || "—"}</td>
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
