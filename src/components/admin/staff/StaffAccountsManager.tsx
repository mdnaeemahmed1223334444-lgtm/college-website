"use client";

import { useState, useTransition } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";
import { adminResetTeacherPasswordAction } from "@/features/staff/actions";

export default function StaffAccountsManager({
  staffList,
}: {
  staffList: StaffProfileRecord[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password reset modal state
  const [resetModalStaff, setResetModalStaff] = useState<StaffProfileRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = (id: string, pwd?: string | null) => {
    const textToCopy = pwd || "teacher123";
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
  };

  const handlePerformPasswordReset = () => {
    if (!resetModalStaff) return;
    if (newPassword.trim().length < 6) {
      setFeedback({ error: "Password must be at least 6 characters long." });
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      const res = await adminResetTeacherPasswordAction(resetModalStaff.id, newPassword.trim());
      if (res.error) {
        setFeedback({ error: res.error });
      } else {
        setFeedback({ success: res.message || "Teacher password updated successfully!" });
        // Update local object so current password updates in UI
        resetModalStaff.portal_password = newPassword.trim();
      }
    });
  };

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
          <h1 className="text-xl font-bold text-gray-900">Teacher &amp; Staff Account Credentials</h1>
          <p className="text-xs text-gray-500 mt-1">
            View teacher portal passwords, login usernames/emails, and manage password resets.
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

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Login Username / ID</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Current Password</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((staff) => {
                const isVisible = visiblePasswords[staff.id];
                const displayPassword = staff.portal_password || "teacher123";

                return (
                  <tr key={staff.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{staff.full_name}</div>
                      <div className="text-xs text-gray-500 font-mono">ID: {staff.employee_id}</div>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-xs font-medium text-gray-700">
                      {staff.role === "teacher" ? "Teacher Portal" : "Staff Portal"}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-900">
                      <div>{staff.employee_id}</div>
                      <div className="text-[11px] text-gray-500">{staff.email}</div>
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

                    {/* Current Password Column (Admin Viewable) */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                            isVisible
                              ? "bg-teal-50 text-teal-900 border-teal-300"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {isVisible ? displayPassword : "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(staff.id)}
                          className="text-gray-500 hover:text-gray-800 p-1 text-xs"
                          title={isVisible ? "Hide Password" : "Show Current Password"}
                        >
                          {isVisible ? "🙈" : "👁️"}
                        </button>
                        {isVisible && (
                          <button
                            type="button"
                            onClick={() => copyPassword(staff.id, displayPassword)}
                            className="text-gray-500 hover:text-teal-700 p-1 text-xs"
                            title="Copy password to clipboard"
                          >
                            {copiedId === staff.id ? "✅" : "📋"}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setResetModalStaff(staff);
                          setNewPassword("");
                          setFeedback(null);
                        }}
                        className="rounded border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                      >
                        🔑 Reset Password
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal for Teachers */}
      {resetModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Password Settings: {resetModalStaff.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setResetModalStaff(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Password Display */}
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                Current Password on Record:
              </div>
              <div className="mt-1 flex items-center justify-between font-mono font-bold text-sm text-teal-950">
                <span>{resetModalStaff.portal_password || "teacher123"}</span>
                <button
                  type="button"
                  onClick={() =>
                    copyPassword(
                      resetModalStaff.id,
                      resetModalStaff.portal_password || "teacher123"
                    )
                  }
                  className="rounded border border-teal-300 bg-white px-2 py-0.5 text-xs text-teal-800 hover:bg-teal-100"
                >
                  {copiedId === resetModalStaff.id ? "Copied! ✅" : "Copy 📋"}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Assign a new portal password for Teacher ID{" "}
              <strong className="font-mono text-gray-900">{resetModalStaff.employee_id}</strong>.
            </p>

            {feedback?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {feedback.error}
              </div>
            )}

            {feedback?.success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                {feedback.success}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                New Password (minimum 6 characters)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter or generate password"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  🎲 Generate
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setResetModalStaff(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending || !newPassword.trim()}
                onClick={handlePerformPasswordReset}
                className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50 transition"
              >
                {isPending ? "Updating Password…" : "Save New Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
