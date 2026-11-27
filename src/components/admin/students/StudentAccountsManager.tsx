"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { StudentRecord, BatchRecord } from "@/features/students/types";
import { toggleStudentStatusAction } from "@/features/students/actions";
import { adminResetStudentPasswordAction } from "@/features/students/auth-actions";

interface Props {
  students: StudentRecord[];
  batches: BatchRecord[];
}

export default function StudentAccountsManager({ students, batches }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isPending, startTransition] = useTransition();

  // Map of student id -> boolean for toggling password visibility
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password reset modal state
  const [resetModalStudent, setResetModalStudent] = useState<StudentRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [modalFeedback, setModalFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyPassword = (id: string, pwd?: string | null) => {
    const textToCopy = pwd || "student123";
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedBatch !== "all" && s.batch_id !== selectedBatch) return false;
    if (selectedGroup !== "all" && s.study_group !== selectedGroup) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = s.full_name?.toLowerCase().includes(q);
      const matchCode = s.student_code?.toLowerCase().includes(q);
      const matchRoll = s.roll?.toString().includes(q);
      const matchPhone = s.phone?.includes(q);
      const matchSession = s.academic_session?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchRoll && !matchPhone && !matchSession) return false;
    }
    return true;
  });

  const handleToggleStatus = (student: StudentRecord) => {
    const nextStatus = student.status === "active" ? "suspended" : "active";
    const confirmMsg =
      nextStatus === "suspended"
        ? `Are you sure you want to deactivate ${student.full_name}'s account? They will lose access to the student portal immediately.`
        : `Re-activate account for ${student.full_name}?`;

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await toggleStudentStatusAction(student.id, nextStatus);
      if (res.error) {
        alert(res.error);
      }
    });
  };

  const handleOpenResetModal = (student: StudentRecord) => {
    setResetModalStudent(student);
    setNewPassword("");
    setModalFeedback(null);
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
    if (!resetModalStudent) return;
    if (newPassword.trim().length < 6) {
      setModalFeedback({ error: "Password must be at least 6 characters long." });
      return;
    }

    startTransition(async () => {
      setModalFeedback(null);
      const res = await adminResetStudentPasswordAction(resetModalStudent.id, newPassword.trim());
      if (res.error) {
        setModalFeedback({ error: res.error });
      } else {
        setModalFeedback({ success: res.message || "Password updated successfully!" });
        // Update local object so current password updates in UI
        resetModalStudent.current_password = newPassword.trim();
        resetModalStudent.has_password = true;
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Search Students
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Student ID, Session, or Roll…"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Batch Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Groups</option>
              <option value="science">Science</option>
              <option value="business_studies">Business Studies</option>
              <option value="humanities">Humanities</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Account Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="dropped">Dropped</option>
              <option value="passed_out">Passed Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm font-bold text-gray-900">
            Student Accounts &amp; Credentials ({filteredStudents.length})
          </div>
          <Link
            href="/admin/students/new"
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition"
          >
            + Create New Student Profile
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Batch &amp; Group</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Current Password</th>
                <th className="px-4 py-3">RFID Card</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No student accounts matched your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isVisible = visiblePasswords[student.id];
                  const displayPassword = student.current_password || "student123";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      {/* Student Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center">
                              {student.full_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900">{student.full_name}</div>
                            {student.bangla_name && (
                              <div className="text-[11px] text-gray-500">{student.bangla_name}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code & Roll */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-blue-700">{student.student_code}</div>
                        <div className="text-[11px] text-gray-500">Roll: #{student.roll}</div>
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{student.batch_name}</div>
                        <div className="text-[11px] capitalize text-gray-500">
                          {student.study_group?.replace("_", " ")}
                        </div>
                      </td>

                      {/* Academic Session */}
                      <td className="px-4 py-3 font-mono text-gray-600">
                        {student.academic_session || "2025-2026"}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                            student.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : student.status === "suspended"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      {/* Current Password (Admin Viewable) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                              isVisible
                                ? "bg-amber-50 text-amber-900 border-amber-300"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            {isVisible ? displayPassword : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(student.id)}
                            className="text-gray-500 hover:text-gray-800 p-1 text-xs"
                            title={isVisible ? "Hide Password" : "Show Current Password"}
                          >
                            {isVisible ? "🙈" : "👁️"}
                          </button>
                          {isVisible && (
                            <button
                              type="button"
                              onClick={() => copyPassword(student.id, displayPassword)}
                              className="text-gray-500 hover:text-blue-700 p-1 text-xs"
                              title="Copy password to clipboard"
                            >
                              {copiedId === student.id ? "✅" : "📋"}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* RFID */}
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                        {student.rfid_card_id || "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenResetModal(student)}
                            className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                            title="Reset student login password"
                          >
                            🔑 Reset
                          </button>

                          {/* Toggle Status */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleStatus(student)}
                            className={`rounded px-2.5 py-1 text-xs font-bold transition ${
                              student.status === "active"
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {student.status === "active" ? "Deactivate" : "Activate"}
                          </button>

                          {/* Edit Link */}
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Password Settings: {resetModalStudent.full_name}
              </h3>
              <button
                type="button"
                onClick={() => setResetModalStudent(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Current Password Display */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Current Password on Record:
              </div>
              <div className="mt-1 flex items-center justify-between font-mono font-bold text-sm text-amber-950">
                <span>{resetModalStudent.current_password || "student123 (Default)"}</span>
                <button
                  type="button"
                  onClick={() =>
                    copyPassword(
                      resetModalStudent.id,
                      resetModalStudent.current_password || "student123"
                    )
                  }
                  className="rounded border border-amber-300 bg-white px-2 py-0.5 text-xs text-amber-800 hover:bg-amber-100"
                >
                  {copiedId === resetModalStudent.id ? "Copied! ✅" : "Copy 📋"}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              To change this password, enter a new one below or click Generate.
            </p>

            {modalFeedback?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                {modalFeedback.error}
              </div>
            )}

            {modalFeedback?.success && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                {modalFeedback.success}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                Assign New Password (minimum 6 characters)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter or generate password"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-none"
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
                onClick={() => setResetModalStudent(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isPending || !newPassword.trim()}
                onClick={handlePerformPasswordReset}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 transition"
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
