import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getStudentAttendanceSummary } from "@/features/attendance/queries";
import { formatDhakaDate, getDhakaDate, formatDhakaDayOfWeek } from "@/lib/utils/datetime";
import { privateAdmin } from "@/lib/supabase/private-server";

export const metadata = {
  title: "Student Dashboard | Student Portal",
};

function StatCard({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  icon: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black">{value}</span>
        {unit && <span className="text-sm font-bold opacity-70">{unit}</span>}
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
  description,
}: {
  href: string;
  label: string;
  icon: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <span className="text-2xl mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default async function StudentDashboardPage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const attendance = await getStudentAttendanceSummary(student.id);

  const today = formatDhakaDate(getDhakaDate());
  const todayDay = formatDhakaDayOfWeek(getDhakaDate());

  // Fetch today's classes from class_routines for student's batch and group
  let todayClasses: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("class_routines")
        .select("*")
        .eq("is_published", true)
        .eq("day_of_week", todayDay)
        .or(`batch_id.is.null,batch_id.eq.${student.batch_id || ""}`)
        .order("start_time");

      if (data && data.length > 0) {
        todayClasses = data.filter(
          (r: any) => !r.study_group || r.study_group === student.study_group
        );
      }
    } catch {
      // ignore
    }
  }

  const studyGroupLabel: Record<string, string> = {
    science: "Science",
    business_studies: "Business Studies",
    humanities: "Humanities",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Welcome back, {student.full_name.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {today} — Your academic overview for today
          </p>
        </div>
        <Link
          href="/student/profile"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          👤 My Profile
        </Link>
      </div>

      {/* Student Identity Card */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Photo */}
          <div className="flex-shrink-0">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-white/20 ring-4 ring-white/30 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">
                  {student.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white truncate">{student.full_name}</h2>
            {student.bangla_name && (
              <p className="text-blue-200 text-sm">{student.bangla_name}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
              <span className="bg-white/15 rounded-full px-3 py-1">
                🪪 {student.student_code}
              </span>
              <span className="bg-white/15 rounded-full px-3 py-1">
                📚 {student.batch_name}
              </span>
              {student.study_group && (
                <span className="bg-white/15 rounded-full px-3 py-1">
                  🔬 {studyGroupLabel[student.study_group] || student.study_group}
                </span>
              )}
              {student.roll && (
                <span className="bg-white/15 rounded-full px-3 py-1">
                  Roll: {student.roll}
                </span>
              )}
              {student.section && (
                <span className="bg-white/15 rounded-full px-3 py-1">
                  Section: {student.section}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <span>📅</span> Today's Classes — <span className="text-blue-700">{todayDay}</span>
          </h2>
          <Link
            href="/student/class-routine"
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Full Timetable →
          </Link>
        </div>

        {todayClasses.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500 shadow-xs">
            {["Friday", "Saturday"].includes(todayDay) ? (
              <p>🎉 Today is a weekend off-day. No classes scheduled.</p>
            ) : (
              <p>No classes scheduled for today.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayClasses.map((c: any, i: number) => (
              <div
                key={c.id || i}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs hover:border-blue-300 transition-all"
                style={c.color ? { borderTopColor: c.color, borderTopWidth: 3 } : {}}
              >
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-mono font-bold">
                  <span>
                    {c.start_time?.slice(0, 5)} – {c.end_time?.slice(0, 5)}
                  </span>
                  {c.room_number && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
                      {c.room_number}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 truncate">{c.subject}</h3>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-gray-500 truncate">{c.teacher_name || "—"}</span>
                  {c.is_physical_training && (
                    <span className="rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-[10px] font-bold">
                      🏃 PT
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendance Stats */}
      {attendance && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
            Attendance Summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Present Days"
              value={attendance.present_days}
              unit="Days"
              color="border-emerald-100 bg-emerald-50 text-emerald-800"
              icon="✅"
            />
            <StatCard
              label="Late Days"
              value={attendance.late_days}
              unit="Days"
              color="border-amber-100 bg-amber-50 text-amber-800"
              icon="⏰"
            />
            <StatCard
              label="Absent Days"
              value={attendance.absent_days}
              unit="Days"
              color="border-rose-100 bg-rose-50 text-rose-800"
              icon="❌"
            />
            <StatCard
              label="Attendance Rate"
              value={attendance.percentage}
              unit="%"
              color={
                attendance.percentage >= 75
                  ? "border-blue-100 bg-blue-50 text-blue-800"
                  : "border-red-100 bg-red-50 text-red-800"
              }
              icon={attendance.percentage >= 75 ? "📊" : "⚠️"}
            />
          </div>
          {attendance.percentage < 75 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-start gap-2">
              <span>⚠️</span>
              <p>
                Your attendance is below the 75% minimum required for exam eligibility.
                Please contact your class teacher.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/student/attendance"
            label="Attendance Records"
            icon="🪪"
            description="View your RFID gate scan history"
          />
          <QuickLink
            href="/student/class-routine"
            label="Class Routine"
            icon="📅"
            description="Your weekly timetable"
          />
          <QuickLink
            href="/student/exam-schedule"
            label="Exam Schedule"
            icon="📝"
            description="Upcoming examination dates"
          />
          <QuickLink
            href="/student/results"
            label="Exam Results"
            icon="🏆"
            description="View your published results"
          />
          <QuickLink
            href="/student/notices"
            label="Notices"
            icon="📢"
            description="College announcements & notices"
          />
          <QuickLink
            href="/student/id-card"
            label="Digital ID Card"
            icon="🎓"
            description="Your student identity card"
          />
        </div>
      </div>

      {/* RFID Card Info */}
      {student.rfid_card_id && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4 text-xs text-indigo-900 flex items-start gap-3">
          <span className="text-xl">🪪</span>
          <div>
            <span className="font-bold">RFID Card Linked:</span> Card ID{" "}
            <code className="font-mono bg-white/60 px-1 rounded">{student.rfid_card_id}</code> is
            registered to your account. Tap it at the campus gate to record attendance.
          </div>
        </div>
      )}
    </div>
  );
}
