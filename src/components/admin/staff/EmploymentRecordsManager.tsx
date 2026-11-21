"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";

export default function EmploymentRecordsManager({
  staffList,
}: {
  staffList: StaffProfileRecord[];
}) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filtered = staffList.filter((s) => {
    if (filterType !== "all" && s.employment_type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.employee_id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Employment & Service Records</h1>
          <p className="text-xs text-gray-500 mt-1">
            Permanent vs contractual tenure, appointment dates, years in institutional service, and employment status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Employment Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 p-1.5 text-xs font-semibold focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Types ({staffList.length})</option>
            <option value="permanent">Permanent Full-Time</option>
            <option value="contractual">Contractual</option>
            <option value="part_time">Part-Time</option>
            <option value="guest">Guest Faculty</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <input
            type="text"
            placeholder="Search by name, ID, designation, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Designation & Dept</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3">Service Length</th>
                <th className="px-4 py-3">Employment Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900">{staff.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">ID: {staff.employee_id}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-800">{staff.designation}</div>
                    <div className="text-xs text-gray-500">{staff.department}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium text-gray-800 font-mono">
                    {staff.joining_date}
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    <span className="font-bold text-teal-800">
                      {staff.experience_years || 0} Years
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        staff.employment_type === "permanent"
                          ? "bg-teal-50 text-teal-700 border border-teal-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {staff.employment_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
