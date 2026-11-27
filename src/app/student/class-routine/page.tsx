import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";
import { getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";

export const metadata = {
  title: "Class Routine | Student Portal",
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOrder: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

function formatTime(t?: string | null) {
  if (!t) return "—";
  return t.slice(0, 5);
}

export default async function ClassRoutinePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const todayName = formatDhakaDayOfWeek(getDhakaDate());

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
        routineRecords = data.filter(
          (r: any) => !r.study_group || r.study_group === student.study_group
        );
      }
    } catch {
      // Table may not exist yet — show helpful message
    }
  }

  // Today's classes
  const todayClasses = routineRecords
    .filter((r: any) => r.day_of_week === todayName)
    .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));

  // Group all records by day
  const byDay = new Map<string, any[]>();
  for (const r of routineRecords) {
    if (!byDay.has(r.day_of_week)) byDay.set(r.day_of_week, []);
    byDay.get(r.day_of_week)!.push(r);
  }

  const sortedDays = Array.from(byDay.keys()).sort(
    (a, b) => (dayOrder[a] ?? 99) - (dayOrder[b] ?? 99)
  );

  const studyGroupLabel: Record<string, string> = {
    science: "Science",
    business_studies: "Business Studies",
    humanities: "Humanities",
  };

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
              <> — {studyGroupLabel[student.study_group] || student.study_group}</>
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

      {/* Today's Classes */}
      <div className={`rounded-2xl border p-5 shadow-sm ${todayClasses.length > 0 ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50" : "border-gray-200 bg-gray-50"}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📅</span>
          <h2 className="text-sm font-black text-gray-900">Today's Classes — <span className="text-blue-700">{todayName}</span></h2>
        </div>
        {todayClasses.length === 0 ? (
          <p className="text-sm text-gray-500">
            {["Friday", "Saturday"].includes(todayName)
              ? "🎉 Today is a weekly holiday. No classes scheduled."
              : "No classes are scheduled for today."}
          </p>
        ) : (
          <div className="space-y-2">
            {todayClasses.map((r: any, i: number) => (
              <div
                key={r.id || i}
                className="flex items-center gap-3 rounded-xl border border-white bg-white/80 px-4 py-3 shadow-xs"
                style={r.color ? { borderLeftColor: r.color, borderLeftWidth: 4 } : {}}
              >
                <div className="text-xs font-mono font-black text-gray-900 whitespace-nowrap w-24">
                  {formatTime(r.start_time)} – {formatTime(r.end_time)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{r.subject}</p>
                  {r.teacher_name && <p className="text-xs text-gray-500">{r.teacher_name}</p>}
                </div>
                {r.room_number && (
                  <span className="text-xs text-gray-500 font-semibold">{r.room_number}</span>
                )}
                {r.is_physical_training && (
                  <span className="rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-[10px] font-bold">🏃 PT</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Weekly Timetable */}
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
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Full Weekly Timetable</h2>
          <div className="space-y-4">
            {sortedDays.map((day) => {
              const isToday = day === todayName;
              return (
                <div key={day} className={`rounded-xl border overflow-hidden shadow-sm ${isToday ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-200"} bg-white`}>
                  <div className={`px-5 py-3 flex items-center gap-2 ${isToday ? "bg-blue-700" : "bg-gray-800"}`}>
                    <h2 className="text-sm font-bold text-white">{day}</h2>
                    {isToday && <span className="rounded-full bg-white/20 text-white text-[10px] font-bold px-2 py-0.5">TODAY</span>}
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
                              {formatTime(r.start_time)} – {formatTime(r.end_time)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {r.color && <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: r.color }} />}
                              {r.subject}
                              {r.is_physical_training && (
                                <span className="ml-2 rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 text-[9px] font-bold">🏃 PT</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.teacher_name || "—"}</td>
                            <td className="px-4 py-3 text-gray-500">{r.room_number || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
