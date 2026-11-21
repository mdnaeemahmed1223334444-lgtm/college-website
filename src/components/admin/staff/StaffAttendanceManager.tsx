"use client";

import { useState } from "react";
import type { StaffAttendanceRecord } from "@/features/staff/types";

export default function StaffAttendanceManager({
  attendanceList,
  currentDate,
}: {
  attendanceList: StaffAttendanceRecord[];
  currentDate: string;
}) {
  const [date, setDate] = useState(currentDate);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const presentCount = attendanceList.filter((a) => a.status === "present").length;
  const lateCount = attendanceList.filter((a) => a.status === "late").length;
  const leaveCount = attendanceList.filter((a) => a.status === "leave").length;
  const absentCount = attendanceList.filter((a) => a.status === "absent").length;
  const attendancePct =
    attendanceList.length > 0
      ? Math.round(((presentCount + lateCount) / attendanceList.length) * 100)
      : 0;

  const filtered = attendanceList.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.employee_id.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Daily Staff & Teacher Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track daily faculty and employee biometric check-in times, late arrivals, approved leaves, and absences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-700">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 text-xs font-medium focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Present</span>
          <p className="text-2xl font-bold text-green-700 mt-1">{presentCount}</p>
          <span className="text-xs text-green-600 font-medium">On-time check-in</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Late</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lateCount}</p>
          <span className="text-xs text-amber-600 font-medium">After 08:30 AM</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</span>
          <p className="text-2xl font-bold text-blue-700 mt-1">{leaveCount}</p>
          <span className="text-xs text-blue-600 font-medium">Sanctioned leave</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</span>
          <p className="text-2xl font-bold text-rose-700 mt-1">{absentCount}</p>
          <span className="text-xs text-rose-600 font-medium">Unexcused</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</span>
          <p className="text-2xl font-bold text-teal-800 mt-1">{attendancePct}%</p>
          <span className="text-xs text-teal-600 font-medium">Total turn-out</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search staff by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All ({attendanceList.length})</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="leave">On Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role & Dept</th>
                <th className="px-4 py-3">In Time</th>
                <th className="px-4 py-3">Out Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((att) => (
                <tr key={att.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900">{att.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">ID: {att.employee_id}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-gray-900 capitalize">{att.role}</div>
                    <div className="text-xs text-gray-500">{att.department}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs">{att.in_time || "-"}</td>
                  <td className="px-4 py-3.5 font-mono text-xs">{att.out_time || "-"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        att.status === "present"
                          ? "bg-green-100 text-green-800"
                          : att.status === "late"
                          ? "bg-amber-100 text-amber-800"
                          : att.status === "leave"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {att.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{att.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
