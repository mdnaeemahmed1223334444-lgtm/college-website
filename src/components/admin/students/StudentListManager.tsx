"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { StudentRecord, BatchRecord, StudyGroup, StudentStatus } from "@/features/students/types";
import { deleteStudentAction, toggleStudentStatusAction } from "@/features/students/actions";
import StudentForm from "./StudentForm";

interface StudentListManagerProps {
  initialStudents: StudentRecord[];
  batches: BatchRecord[];
}

export default function StudentListManager({
  initialStudents,
  batches,
}: StudentListManagerProps) {
  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | "all">("all");

  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (selectedBatch !== "all" && s.batch_id !== selectedBatch) return false;
    if (selectedGroup !== "all" && s.study_group !== selectedGroup) return false;
    if (selectedStatus !== "all" && s.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = s.full_name.toLowerCase().includes(q);
      const matchCode = s.student_code.toLowerCase().includes(q);
      const matchRoll = s.roll.toString().includes(q);
      const matchPhone = s.phone?.toLowerCase().includes(q);
      const matchRfid = s.rfid_card_id?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchRoll && !matchPhone && !matchRfid) return false;
    }
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteStudentAction(id);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        setFeedback({ type: "success", text: res.message || "Student deleted successfully." });
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to delete student." });
      }
    });
  };

  const handleToggleStatus = (id: string, current: StudentStatus) => {
    const nextStatus: StudentStatus =
      current === "active" ? "suspended" : current === "suspended" ? "active" : "active";

    startTransition(async () => {
      const res = await toggleStudentStatusAction(id, nextStatus);
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
        );
        setFeedback({ type: "success", text: res.message || "Status updated." });
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update status." });
      }
    });
  };

  const groupBadge = (group: StudyGroup) => {
    switch (group) {
      case "science":
        return <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Science</span>;
      case "business_studies":
        return <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">Business Studies</span>;
      case "humanities":
        return <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Humanities</span>;
    }
  };

  const statusBadge = (status: StudentStatus) => {
    switch (status) {
      case "active":
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">● Active</span>;
      case "suspended":
        return <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">● Suspended</span>;
      case "dropped":
        return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-800">● Dropped</span>;
      case "passed_out":
        return <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">● Alumni</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg p-4 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Student Directory</h2>
            <p className="text-xs text-gray-500">
              Showing {filteredStudents.length} of {students.length} enrolled students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/students/batches"
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              Manage Batches ({batches.length})
            </Link>

            <button
              onClick={() => {
                setEditingStudent(null);
                setIsAddModalOpen(true);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, roll, ID, RFID..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              HSC Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.exam_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Study Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Groups</option>
              <option value="science">Science</option>
              <option value="business_studies">Business Studies</option>
              <option value="humanities">Humanities</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="dropped">Dropped</option>
              <option value="passed_out">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Student</th>
                <th className="px-4 py-3.5">Batch & Group</th>
                <th className="px-4 py-3.5">Roll No</th>
                <th className="px-4 py-3.5">Contact / Guardian</th>
                <th className="px-4 py-3.5">Hardware / RFID</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="text-2xl mb-2">🎓</div>
                    <p className="font-semibold text-gray-600">No students found matching your filters.</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting the search filters or enroll a new student.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    {/* Student Photo & Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 shadow-xs">
                          {s.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.photo_url}
                              alt={s.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-100 font-bold text-blue-700 text-sm">
                              {s.full_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{s.full_name}</div>
                          {s.bangla_name && (
                            <div className="text-[11px] text-gray-500">{s.bangla_name}</div>
                          )}
                          <div className="font-mono text-[10px] text-blue-600">{s.student_code}</div>
                        </div>
                      </div>
                    </td>

                    {/* Batch & Group */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{s.batch_name || "HSC Batch"}</div>
                      <div className="mt-0.5">{groupBadge(s.study_group)}</div>
                    </td>

                    {/* Roll */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-gray-900">Roll: #{s.roll}</div>
                    </td>

                    {/* Contact & Guardian */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{s.phone || "—"}</div>
                      {s.guardian_name && (
                        <div className="text-[11px] text-gray-500">
                          G: {s.guardian_name} ({s.guardian_phone || "No phone"})
                        </div>
                      )}
                    </td>

                    {/* Hardware RFID UID */}
                    <td className="px-4 py-3">
                      {s.rfid_card_id ? (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-indigo-700 border border-indigo-200">
                          <span>📡</span> {s.rfid_card_id}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Not paired</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(s.id, s.status)}
                        disabled={isPending}
                        title="Click to toggle status"
                        className="hover:opacity-80 transition-opacity"
                      >
                        {statusBadge(s.status)}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingStudent(s)}
                          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 shadow-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.full_name)}
                          disabled={isPending}
                          className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Student */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50/80">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingStudent ? `Edit Student: ${editingStudent.full_name}` : "Enroll New Student"}
                </h3>
                <p className="text-xs text-gray-500">
                  All fields are preserved even if an error occurs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              <StudentForm
                initialData={editingStudent}
                batches={batches}
                isModal={true}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
