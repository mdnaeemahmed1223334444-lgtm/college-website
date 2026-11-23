import Link from "next/link";
import { getAttendanceRecords, getAttendanceStats } from "@/features/attendance/queries";

export const metadata = {
  title: "My Attendance Records | Student Portal",
  description: "View your RFID gate attendance scan history and attendance statistics.",
};

export default async function StudentAttendancePage() {
  const [records, stats] = await Promise.all([
    getAttendanceRecords(),
    getAttendanceStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Attendance Records</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time RFID gate check-in logs and your monthly attendance summary.
          </p>
        </div>

        <Link
          href="/student"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Present Days</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{stats.presentCount}</span>
            <span className="text-xs font-bold text-emerald-800">Days</span>
          </div>
          <div className="mt-3 text-xs text-emerald-700">On-time gate entries before 09:15 AM</div>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800">Late Days</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{stats.lateCount}</span>
            <span className="text-xs font-bold text-amber-800">Days</span>
          </div>
          <div className="mt-3 text-xs text-amber-700">Arrivals after 09:15 AM cutoff</div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800">Overall Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">{stats.attendanceRate}%</span>
          </div>
          <div className="mt-3 text-xs text-blue-700">Required minimum: 75% for exam eligibility</div>
        </div>
      </div>

      {/* Hardware Gate Info Notice */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-xs text-indigo-950 flex items-start gap-3">
        <span className="text-xl">🪪</span>
        <div>
          <span className="font-bold">Smart RFID Gate Pass:</span> Tap your college ID card on the reader at Gate 01 when entering the campus. Scans are recorded in real-time under Asia/Dhaka timezone.
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">Today&apos;s Gate Log ({records.length})</h3>
          <span className="text-xs font-semibold text-gray-500">{stats.date}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Check-In Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Gate Scanner</th>
                <th className="px-4 py-3">Card Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No scans recorded yet for today. Tap your card at the gate to check in.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.student_name}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.student_code}</td>
                    <td className="px-4 py-3 font-mono text-gray-800">{r.in_time}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                          r.status === "present"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "late"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.device_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.rfid_card_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
