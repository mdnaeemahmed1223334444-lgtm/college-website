"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";
import { saveStaffAssignmentsAction } from "@/features/staff/actions";
import { SubmitButton } from "@/components/admin/website/FormControls";

export default function DepartmentAssignmentManager({
  teachers,
}: {
  teachers: StaffProfileRecord[];
}) {
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [assigningTeacher, setAssigningTeacher] = useState<StaffProfileRecord | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // Group by department
  const depts = Array.from(new Set(teachers.map((t) => t.department))).sort();

  const filtered = selectedDept === "all" ? teachers : teachers.filter((t) => t.department === selectedDept);

  async function handleAssignSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!assigningTeacher) return;
    const form = new FormData(e.currentTarget);
    const res = await saveStaffAssignmentsAction({}, form);
    if (res.error) {
      alert(`Error: ${res.error}`);
    } else {
      setMsg(res.message || "Department assignment saved.");
      setAssigningTeacher(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Department Assignment & HOD Allocation</h1>
          <p className="text-xs text-gray-500 mt-1">
            Group teachers under departments, assign Head of Department (HOD) responsibilities, and balance faculty distribution.
          </p>
        </div>
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-gray-300 p-2 text-xs font-semibold focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Departments ({depts.length})</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {msg}
        </div>
      )}

      {/* Department Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {depts
          .filter((d) => selectedDept === "all" || d === selectedDept)
          .map((deptName) => {
            const faculty = teachers.filter((t) => t.department === deptName);
            const hod = faculty.find((t) => t.is_head_of_department);

            return (
              <div
                key={deptName}
                className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col"
              >
                <div className="border-b border-gray-200 bg-teal-50/60 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{deptName}</h3>
                    <p className="text-xs text-gray-500">
                      Total Faculty: <strong className="text-teal-800">{faculty.length}</strong>
                    </p>
                  </div>
                  {hod ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900">
                      👑 HOD: {hod.full_name}
                    </span>
                  ) : (
                    <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-medium">
                      No HOD Assigned
                    </span>
                  )}
                </div>

                <div className="p-4 divide-y divide-gray-100 flex-1">
                  {faculty.map((member) => (
                    <div
                      key={member.id}
                      className="py-2.5 flex items-center justify-between hover:bg-gray-50/80 rounded px-2 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800 text-xs">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-xs text-gray-900 flex items-center gap-1.5">
                            {member.full_name}
                            {member.is_head_of_department && (
                              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1 rounded">
                                HOD
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {member.designation} • ID: {member.employee_id}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setAssigningTeacher(member)}
                        className="rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50"
                      >
                        Reassign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Reassign Modal */}
      {assigningTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-teal-800 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Assign Department & Role</h3>
                <p className="text-xs text-teal-200">{assigningTeacher.full_name}</p>
              </div>
              <button
                onClick={() => setAssigningTeacher(null)}
                className="text-white hover:text-teal-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-5 space-y-4">
              <input type="hidden" name="staff_id" value={assigningTeacher.id} />
              <input
                type="hidden"
                name="weekly_periods"
                value={assigningTeacher.weekly_periods || 0}
              />
              <input
                type="hidden"
                name="assigned_subjects"
                value={assigningTeacher.assigned_subjects?.join(",") || ""}
              />
              <input
                type="hidden"
                name="assigned_classes"
                value={assigningTeacher.assigned_classes?.join(",") || ""}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  defaultValue={assigningTeacher.department}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                >
                  {depts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_head_of_department"
                    value="true"
                    defaultChecked={assigningTeacher.is_head_of_department || false}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  Designate as Head of Department (HOD)
                </label>
                <p className="text-[11px] text-amber-800 ml-6 mt-1">
                  If selected, this teacher will lead administrative curriculum reviews for this department.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAssigningTeacher(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SubmitButton label="Save Assignment" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
