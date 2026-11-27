import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getStudentAttendanceSummary } from "@/features/attendance/queries";

export const metadata = {
  title: "My Attendance | Student Portal",
  description: "View your campus gate attendance history and monthly statistics.",
};

export default async function StudentAttendancePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const attendance = await getStudentAttendanceSummary(student.id);

  const statusColor: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-800",
    late: "bg-amber-100 text-amber-800",
    absent: "bg-rose-100 text-rose-800",
    leave: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Attendance Records</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete campus gate check-in & departure history — Bangladesh Standard Time (Asia/Dhaka)
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Summary */}
      {attendance ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Present</div>
              <div className="mt-2 text-3xl font-black text-emerald-800">{attendance.present_days}</div>
              <div className="text-xs text-emerald-600 mt-1">Days</div>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Late</div>
              <div className="mt-2 text-3xl font-black text-amber-800">{attendance.late_days}</div>
              <div className="text-xs text-amber-600 mt-1">Days</div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700">Absent</div>
              <div className="mt-2 text-3xl font-black text-rose-800">{attendance.absent_days}</div>
              <div className="text-xs text-rose-600 mt-1">Days</div>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                attendance.percentage >= 75
                  ? "border-blue-100 bg-blue-50"
                  : "border-red-100 bg-red-50"
              }`}
            >
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  attendance.percentage >= 75 ? "text-blue-700" : "text-red-700"
                }`}
              >
                Rate
              </div>
              <div
                className={`mt-2 text-3xl font-black ${
                  attendance.percentage >= 75 ? "text-blue-800" : "text-red-800"
                }`}
              >
                {attendance.percentage}%
              </div>
              <div
                className={`text-xs mt-1 ${
                  attendance.percentage >= 75 ? "text-blue-600" : "text-red-600 font-bold"
                }`}
              >
                {attendance.percentage >= 75 ? "Exam Eligible" : "⚠️ Below 75% threshold"}
              </div>
            </div>
          </div>

          {/* Gate Attendance Info Banner */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-xs text-indigo-900 flex items-start gap-3">
            <span className="text-xl">🪪</span>
            <div>
              <span className="font-bold">Automated Campus Gate Attendance:</span> Tap your college ID card at
              Gate 01 to record attendance. All times are displayed in Bangladesh Standard Time (UTC+6, 12-hour format).
              {student.rfid_card_id && (
                <> Your card ID: <code className="font-mono bg-white/60 px-1 rounded">{student.rfid_card_id}</code>.</>
              )}
            </div>
          </div>

          {/* Attendance Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Complete Attendance History ({attendance.records.length} records)
              </h3>
              <span className="text-xs font-semibold text-gray-500">
                Total College Days: {attendance.total_class_days}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Check-In Time</th>
                    <th className="px-4 py-3">Check-Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {attendance.records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No attendance records found. Tap your ID card at the gate to start recording.
                      </td>
                    </tr>
                  ) : (
                    attendance.records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">
                          {r.formatted_date || r.date}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.day_of_week}</td>
                        <td className="px-4 py-3 font-mono text-gray-800">
                          {r.formatted_time || r.in_time || "—"}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {r.formatted_out_time || r.out_time || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                              statusColor[r.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">
                          {r.device_id || "GATE-01"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-900">No attendance data available</p>
          <p className="text-sm mt-1">Your attendance records will appear here after your ID card is scanned at the campus gate.</p>
        </div>
      )}
    </div>
  );
}
