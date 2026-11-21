"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";
import { saveStaffAssignmentsAction } from "@/features/staff/actions";
import { SubmitButton } from "@/components/admin/website/FormControls";

export default function SubjectAssignmentManager({
  teachers,
}: {
  teachers: StaffProfileRecord[];
}) {
  const [editingTeacher, setEditingTeacher] = useState<StaffProfileRecord | null>(null);
  const [filterSubject, setFilterSubject] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingTeacher) return;
    const form = new FormData(e.currentTarget);
    const res = await saveStaffAssignmentsAction({}, form);
    if (res.error) {
      alert(`Error: ${res.error}`);
    } else {
      setMsg(res.message || "Subject assignments updated.");
      setEditingTeacher(null);
      window.location.reload();
    }
  }

  const filtered = teachers.filter((t) => {
    if (!filterSubject) return true;
    const q = filterSubject.toLowerCase();
    return (
      t.full_name.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.assigned_subjects?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subject Assignment Matrix</h1>
          <p className="text-xs text-gray-500 mt-1">
            Map faculty members to specific academic subjects, papers (Paper 1, Paper 2), and practical sessions.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search teacher, subject, paper..."
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {msg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {msg}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Faculty Member</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Subjects</th>
                <th className="px-4 py-3">Assigned Classes</th>
                <th className="px-4 py-3">Weekly Load</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-900">{t.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {t.designation} • ID: {t.employee_id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-gray-800">{t.department}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {t.assigned_subjects && t.assigned_subjects.length > 0 ? (
                        t.assigned_subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-medium text-teal-800"
                          >
                            {sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No subjects assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">
                    {t.assigned_classes?.join(", ") || "General"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-gray-900">{t.weekly_periods || 0}</span>{" "}
                    <span className="text-xs text-gray-500">periods/wk</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setEditingTeacher(t)}
                      className="rounded bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                    >
                      Edit Subjects
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subjects Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-teal-800 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Assign Subjects to Teacher</h3>
                <p className="text-xs text-teal-200">{editingTeacher.full_name} ({editingTeacher.department})</p>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-white hover:text-teal-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <input type="hidden" name="staff_id" value={editingTeacher.id} />
              <input type="hidden" name="department" value={editingTeacher.department} />
              <input
                type="hidden"
                name="is_head_of_department"
                value={String(editingTeacher.is_head_of_department || false)}
              />
              <input
                type="hidden"
                name="is_class_teacher"
                value={String(editingTeacher.is_class_teacher || false)}
              />
              <input
                type="hidden"
                name="class_teacher_section"
                value={editingTeacher.class_teacher_section || ""}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Subjects (comma-separated) *
                </label>
                <textarea
                  name="assigned_subjects"
                  rows={3}
                  required
                  defaultValue={editingTeacher.assigned_subjects?.join(", ") || ""}
                  placeholder="e.g. Physics 1st Paper, Physics 2nd Paper, Physics Practical"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Enter each subject or paper name separated by commas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assigned Classes / Batches (comma-separated)
                </label>
                <input
                  type="text"
                  name="assigned_classes"
                  defaultValue={editingTeacher.assigned_classes?.join(", ") || ""}
                  placeholder="e.g. XI Science A, XI Science B, XII Science A"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weekly Teaching Periods
                </label>
                <input
                  type="number"
                  name="weekly_periods"
                  defaultValue={editingTeacher.weekly_periods || 18}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SubmitButton label="Update Subjects" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
