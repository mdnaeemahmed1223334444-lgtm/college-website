import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";
import { getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";
import {
  DEFAULT_PERIODS,
  COLLEGE_DAYS,
  DEFAULT_ROUTINES_BY_GROUP,
} from "@/components/admin/academic/ClassRoutineManager";

export const metadata = {
  title: "Class Routine | Student Portal",
};

function formatTime(t?: string | null) {
  if (!t) return "—";
  return t.slice(0, 5);
}

export default async function ClassRoutinePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const todayName = formatDhakaDayOfWeek(getDhakaDate());
  const studyGroup = student.study_group || "science";

  let routineRecords: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("class_routines")
        .select("*")
        .eq("is_published", true)
        .or(`batch_id.is.null,batch_id.eq.${student.batch_id}`)
        .order("day_of_week")
        .order("start_time");

      if (data && data.length > 0) {
        routineRecords = data.filter(
          (r: any) => !r.study_group || r.study_group === student.study_group
        );
      }
    } catch {
      // ignore
    }
  }

  // If no DB routine is published, use default 7-period routine table for this group
  const hasCustomRoutine = routineRecords.length > 0;
  const defaultRoutine = DEFAULT_ROUTINES_BY_GROUP[studyGroup] || DEFAULT_ROUTINES_BY_GROUP.science;

  // Build 7-period structure per day
  const gridByDay: Record<string, Array<{
    periodNumber: number;
    startTime: string;
    endTime: string;
    subject: string;
    teacherName: string;
    isPT: boolean;
  }>> = {};

  for (const day of COLLEGE_DAYS) {
    gridByDay[day] = DEFAULT_PERIODS.map((slot) => {
      if (hasCustomRoutine) {
        const match = routineRecords.find(
          (r: any) =>
            r.day_of_week === day &&
            (r.sort_order === slot.number ||
              r.start_time?.slice(0, 5) === slot.defaultStart ||
              r.start_time?.slice(0, 2) === slot.defaultStart.slice(0, 2))
        );
        if (match) {
          return {
            periodNumber: slot.number,
            startTime: match.start_time?.slice(0, 5) || slot.defaultStart,
            endTime: match.end_time?.slice(0, 5) || slot.defaultEnd,
            subject: match.subject || "",
            teacherName: match.teacher_name || "",
            isPT: Boolean(match.is_physical_training),
          };
        }
      }

      // Default slot
      const defSub = defaultRoutine[day]?.[slot.number - 1] || "";
      const isPT = defSub.toLowerCase().includes("physical training") || defSub.toLowerCase().includes("(pt)");
      return {
        periodNumber: slot.number,
        startTime: slot.defaultStart,
        endTime: slot.defaultEnd,
        subject: defSub,
        teacherName: "",
        isPT,
      };
    });
  }

  // Today's classes
  const todayClasses = gridByDay[todayName] || [];

  const studyGroupLabel: Record<string, string> = {
    science: "Science",
    business_studies: "Business Studies",
    humanities: "Humanities",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">7-Period Class Routine</h1>
          <p className="text-sm text-gray-500 mt-1">
            Weekly timetable for{" "}
            <strong>{student.batch_name}</strong> —{" "}
            <span className="font-bold text-blue-700">
              {studyGroupLabel[studyGroup] || studyGroup}
            </span>
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Connection with Attendance Notice */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
        <span className="text-xl">🪪</span>
        <div>
          <p className="font-bold">RFID Gate Attendance Schedule:</p>
          <p className="mt-0.5 text-blue-800">
            • <strong>Entry Check-in:</strong> 09:00 AM (Period 1). Scans after 09:15 AM will be marked <strong>Late</strong>.<br />
            • <strong>Departure Check-out:</strong> Expected at <strong>01:30 PM</strong> (after Period 6) or <strong>02:10 PM</strong> (after Period 7).<br />
            • <strong>Physical Training (PT):</strong> Excluded from exit calculation; scans during PT do not count as leaving college.
          </p>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h2 className="text-sm font-black text-gray-900">
              Today's Schedule — <span className="text-blue-700">{todayName}</span>
            </h2>
          </div>
          {["Friday", "Saturday"].includes(todayName) && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
              🎉 Weekly Holiday
            </span>
          )}
        </div>

        {["Friday", "Saturday"].includes(todayName) ? (
          <p className="text-xs text-gray-500 italic py-2">
            Today is a weekend off-day. No classes scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {todayClasses.map((item) => (
              <div
                key={item.periodNumber}
                className={`rounded-xl border p-3.5 shadow-xs transition-all ${
                  item.isPT
                    ? "border-orange-200 bg-orange-50/70"
                    : "border-gray-200 bg-gray-50/60"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono font-bold mb-1">
                  <span>Period {item.periodNumber}</span>
                  <span className="text-blue-700">
                    {formatTime(item.startTime)} – {formatTime(item.endTime)}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm truncate">{item.subject}</h3>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500 truncate">{item.teacherName || "Assigned Faculty"}</span>
                  {item.isPT && (
                    <span className="rounded-full bg-orange-200 text-orange-900 px-1.5 py-0.5 text-[10px] font-bold">
                      🏃 PT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full 7-Period Timetable Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-5 py-3.5 text-white flex items-center justify-between">
          <h2 className="text-sm font-black">Weekly 7-Period Timetable (Table View)</h2>
          <span className="text-xs text-blue-200 font-medium">Without Tiffin • 7 Regular Periods</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100/80 border-b border-gray-200 text-gray-700 font-bold">
                <th className="px-4 py-3 border-r border-gray-200 uppercase tracking-wider w-28">
                  Day
                </th>
                {DEFAULT_PERIODS.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-3 py-3 border-r border-gray-200 text-center min-w-[130px] last:border-0"
                  >
                    <div className="font-black text-gray-900">Period {slot.number}</div>
                    <div className="text-[10px] text-gray-500 font-mono font-normal">
                      {slot.defaultStart} – {slot.defaultEnd}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {COLLEGE_DAYS.map((day) => {
                const isToday = day === todayName;
                const periods = gridByDay[day] || [];

                return (
                  <tr
                    key={day}
                    className={`transition-colors ${
                      isToday ? "bg-blue-50/40 ring-1 ring-blue-300 ring-inset" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 bg-gray-50/90 font-black text-gray-900 border-r border-gray-200">
                      <div className="flex items-center gap-1.5">
                        <span>{day}</span>
                        {isToday && (
                          <span className="rounded bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5">
                            TODAY
                          </span>
                        )}
                      </div>
                    </td>

                    {periods.map((slot) => (
                      <td
                        key={slot.periodNumber}
                        className={`px-3 py-2.5 border-r border-gray-200 last:border-0 ${
                          slot.isPT ? "bg-orange-50/50" : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-gray-900 leading-tight block">
                              {slot.subject}
                            </span>
                            {slot.isPT && (
                              <span className="shrink-0 rounded-full bg-orange-100 text-orange-800 border border-orange-300 px-1 py-0.2 text-[9px] font-black">
                                PT
                              </span>
                            )}
                          </div>
                          {slot.teacherName && (
                            <div className="text-[10px] text-gray-500 truncate">
                              👨‍🏫 {slot.teacherName}
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Friday & Saturday Footer */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p>
          🎉 <strong>Friday & Saturday:</strong> Official weekly college holidays. Campus gates & RFID attendance are closed.
        </p>
        <p className="text-gray-400 text-[11px]">
          7 Academic periods per day • No room numbers required
        </p>
      </div>
    </div>
  );
}
