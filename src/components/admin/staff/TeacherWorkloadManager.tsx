"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";

export default function TeacherWorkloadManager({
  teachers,
}: {
  teachers: StaffProfileRecord[];
}) {
  const [loadFilter, setLoadFilter] = useState<string>("all");

  const totalPeriods = teachers.reduce((acc, t) => acc + (t.weekly_periods || 0), 0);
  const avgLoad = teachers.length > 0 ? Math.round((totalPeriods / teachers.length) * 10) / 10 : 0;

  const filtered = teachers.filter((t) => {
    const p = t.weekly_periods || 0;
    if (loadFilter === "heavy") return p >= 22;
    if (loadFilter === "optimal") return p >= 15 && p < 22;
    if (loadFilter === "light") return p < 15;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Teacher Teaching Workload Analysis</h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze weekly teaching periods, balance class allocations, and prevent faculty overburdening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Filter Load:</span>
          <select
            value={loadFilter}
            onChange={(e) => setLoadFilter(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 text-xs font-semibold focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Teachers ({teachers.length})</option>
            <option value="heavy">Heavy (&ge; 22 periods)</option>
            <option value="optimal">Optimal (15-21 periods)</option>
            <option value="light">Light (&lt; 15 periods)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total College Periods/Wk
          </span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalPeriods}</p>
          <span className="text-xs text-gray-400">Across all faculty</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Average Periods / Teacher
          </span>
          <p className="text-2xl font-bold text-teal-700 mt-1">{avgLoad}</p>
          <span className="text-xs text-teal-600">Standard range: 16-20</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Optimal Workload
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {teachers.filter((t) => (t.weekly_periods || 0) >= 15 && (t.weekly_periods || 0) < 22).length}
          </p>
          <span className="text-xs text-emerald-600">Balanced load</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Heavy Load
          </span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {teachers.filter((t) => (t.weekly_periods || 0) >= 22).length}
          </p>
          <span className="text-xs text-amber-600">&ge; 22 periods/week</span>
        </div>
      </div>

      {/* Workload Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Faculty Member</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Classes</th>
                <th className="px-4 py-3">Assigned Subjects</th>
                <th className="px-4 py-3">Weekly Periods</th>
                <th className="px-4 py-3">Workload Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((t) => {
                const periods = t.weekly_periods || 0;
                let statusLabel = "Optimal";
                let statusBadge = "bg-green-100 text-green-800";
                let barColor = "bg-green-600";
                let pct = Math.min(Math.round((periods / 26) * 100), 100);

                if (periods >= 22) {
                  statusLabel = "Heavy";
                  statusBadge = "bg-amber-100 text-amber-800";
                  barColor = "bg-amber-500";
                } else if (periods < 15) {
                  statusLabel = "Light";
                  statusBadge = "bg-blue-100 text-blue-800";
                  barColor = "bg-blue-500";
                }

                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{t.full_name}</div>
                      <div className="text-xs text-gray-500">
                        {t.designation} • ID: {t.employee_id}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{t.department}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {t.assigned_classes?.join(", ") || "General"}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">
                      {t.assigned_subjects?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 w-6">{periods}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
