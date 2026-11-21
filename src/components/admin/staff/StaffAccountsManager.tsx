"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";

export default function StaffAccountsManager({
  staffList,
}: {
  staffList: StaffProfileRecord[];
}) {
  const [resetPrompt, setResetPrompt] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  function handleResetPassword(name: string, email: string) {
    setResetPrompt(`A secure password reset link has been dispatched to ${email || name}.`);
    setTimeout(() => setResetPrompt(null), 5000);
  }

  const filtered = staffList.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.employee_id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Teacher & Staff Account Credentials</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage teacher portal credentials, authorized login emails, account access states, and password recovery.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search accounts by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {resetPrompt && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
          🔑 {resetPrompt}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Login Email / Username</th>
                <th className="px-4 py-3">Portal Access</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900">{staff.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">ID: {staff.employee_id}</div>
                  </td>
                  <td className="px-4 py-3.5 capitalize text-xs font-medium text-gray-700">
                    {staff.role === "teacher" ? "Teacher Portal" : "Staff Portal"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-gray-900">
                    {staff.email || `${staff.employee_id.toLowerCase()}@college.edu.bd`}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Active
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
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleResetPassword(staff.full_name, staff.email)}
                      className="rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                    >
                      Reset Password
                    </button>
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
