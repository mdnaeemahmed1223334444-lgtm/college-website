import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";
import { getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";
import {
  DEFAULT_PERIODS,
  TIFFIN_BREAK,
  COLLEGE_DAYS,
  DEFAULT_ROUTINES_BY_GROUP,
} from "@/features/academic/routine-defaults";
import UnifiedRoutineTable, {
  type RoutineCellData,
} from "@/components/routine/UnifiedRoutineTable";

export const metadata = {
  title: "Class Routine | Student Portal",
};

export default async function ClassRoutinePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const todayName = formatDhakaDayOfWeek(getDhakaDate());
  const studyGroup = student.study_group || "science";

  let routineRecords: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      let query = supabase
        .from("class_routines")
        .select("*")
        .eq("is_published", true);

      // Safe batch_id query to prevent postgrest syntax error
      if (student.batch_id) {
        query = query.or(`batch_id.is.null,batch_id.eq.${student.batch_id}`);
      } else {
        query = query.is("batch_id", null);
      }

      const { data } = await query
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
  const defaultRoutine =
    DEFAULT_ROUTINES_BY_GROUP[studyGroup] || DEFAULT_ROUTINES_BY_GROUP.science;

  // Build 7-period structure per day
  const gridByDay: Record<string, RoutineCellData[]> = {};

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
          const subLower = (match.subject || "").toLowerCase();
          const isPT = Boolean(
            match.is_physical_training ||
              subLower.includes("physical training") ||
              subLower.includes("(pt)")
          );
          const isPractical = Boolean(
            match.is_practical || subLower.includes("practical")
          );

          return {
            periodNumber: slot.number,
            startTime: match.start_time?.slice(0, 5) || slot.defaultStart,
            endTime: match.end_time?.slice(0, 5) || slot.defaultEnd,
            subject: match.subject || "",
            teacherName: match.teacher_name || "",
            isPT,
            isPractical,
          };
        }
      }

      // Default slot
      const defSub = defaultRoutine[day]?.[slot.number - 1] || "";
      const subLower = defSub.toLowerCase();
      const isPT = subLower.includes("physical training") || subLower.includes("(pt)");
      const isPractical = subLower.includes("practical");

      return {
        periodNumber: slot.number,
        startTime: slot.defaultStart,
        endTime: slot.defaultEnd,
        subject: defSub,
        teacherName: "",
        isPT,
        isPractical,
      };
    });
  }

  const studyGroupLabel: Record<string, string> = {
    science: "Science",
    business_studies: "Business Studies",
    humanities: "Humanities",
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Back button and title */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            My Academic Class Routine
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Class timetable for <strong>{student.batch_name}</strong> •{" "}
            <span className="font-bold text-blue-700">
              {studyGroupLabel[studyGroup] || studyGroup}
            </span>
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Unified 7-Period Timetable (Includes Tiffin Break, Today's Classes, and PDF Download) */}
      <UnifiedRoutineTable
        title={`7-Period Class Routine — ${studyGroupLabel[studyGroup] || studyGroup}`}
        subtitle={`Batch: ${student.batch_name} • Student: ${student.full_name} (${student.student_code})`}
        todayName={todayName}
        periods={DEFAULT_PERIODS}
        tiffinBreak={TIFFIN_BREAK}
        collegeDays={COLLEGE_DAYS}
        gridByDay={gridByDay}
        showTeacherName={true}
        userRole="student"
      />

      {/* Attendance Connection Notice */}
      <div className="no-print rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-xs text-gray-700 flex items-start gap-3 shadow-xs">
        <span className="text-xl">🪪</span>
        <div>
          <p className="font-bold text-gray-900">RFID Attendance & Exit Gate Rules:</p>
          <p className="mt-1 text-gray-600 leading-relaxed">
            • <strong>Morning Arrival:</strong> Scan card by 09:00 AM (Period 1). Scans after 09:15 AM are flagged as <strong>Late</strong>.
            <br />
            • <strong>Dismissal / Departure:</strong> Gates scan at <strong>01:30 PM</strong> (after Period 6) or <strong>02:10 PM</strong> (after Period 7). Scanning before class completion will be flagged as <strong>Left Early</strong>.
            <br />
            • <strong>Physical Training (PT) & Practical Exemption:</strong> PT and practical classes do not count as theory departure gates. Leaving before or during them does not flag an early checkout.
            <br />
            • <strong>Holidays & Weekends:</strong> No attendance is recorded on official holidays or weekends (Friday & Saturday).
          </p>
        </div>
      </div>
    </div>
  );
}
