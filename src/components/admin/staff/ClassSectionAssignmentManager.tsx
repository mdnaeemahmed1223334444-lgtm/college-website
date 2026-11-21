"use client";

import { useState } from "react";
import type { StaffProfileRecord } from "@/features/staff/types";
import { saveStaffAssignmentsAction } from "@/features/staff/actions";
import { SubmitButton } from "@/components/admin/website/FormControls";

const SECTIONS = [
  { class: "Class XI", group: "Science", section: "Section A", code: "Class XI - Science A" },
  { class: "Class XI", group: "Science", section: "Section B", code: "Class XI - Science B" },
  { class: "Class XI", group: "Business Studies", section: "Section A", code: "Class XI - Business Studies A" },
  { class: "Class XI", group: "Humanities", section: "Section A", code: "Class XI - Humanities A" },
  { class: "Class XII", group: "Science", section: "Section A", code: "Class XII - Science A" },
  { class: "Class XII", group: "Science", section: "Section B", code: "Class XII - Science B" },
  { class: "Class XII", group: "Business Studies", section: "Section A", code: "Class XII - Business Studies A" },
  { class: "Class XII", group: "Humanities", section: "Section A", code: "Class XII - Humanities A" },
];

export default function ClassSectionAssignmentManager({
  teachers,
}: {
  teachers: StaffProfileRecord[];
}) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await saveStaffAssignmentsAction({}, form);
    if (res.error) {
      alert(`Error: ${res.error}`);
    } else {
      setMsg(res.message || "Class teacher appointed successfully.");
      setSelectedSection(null);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Class & Section Teacher Allocation</h1>
          <p className="text-xs text-gray-500 mt-1">
            Appoint Class Teachers (Mentors) for each section across Class XI and Class XII academic streams.
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {msg}
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((sec) => {
          const appointed = teachers.find(
            (t) => t.is_class_teacher && t.class_teacher_section === sec.code
          );

          return (
            <div
              key={sec.code}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-between hover:border-teal-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                    {sec.class}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {sec.section}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mt-1">{sec.group}</h3>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">{sec.code}</p>

                <div className="mt-4 rounded-lg bg-gray-50 p-3 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Class Teacher / Mentor:
                  </span>
                  {appointed ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-800 text-xs">
                        {appointed.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-teal-900">{appointed.full_name}</div>
                        <div className="text-[10px] text-gray-500">
                          {appointed.department} ({appointed.employee_id})
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-600 font-medium mt-1">
                      ⚠️ Not Appointed Yet
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedSection(sec.code)}
                  className="w-full rounded-lg bg-teal-50 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                >
                  {appointed ? "Change Class Teacher" : "Appoint Class Teacher"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment Modal */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-teal-800 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Appoint Class Teacher</h3>
                <p className="text-xs text-teal-200">{selectedSection}</p>
              </div>
              <button onClick={() => setSelectedSection(null)} className="text-white hover:text-teal-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssign} className="p-5 space-y-4">
              <input type="hidden" name="is_class_teacher" value="true" />
              <input type="hidden" name="class_teacher_section" value={selectedSection} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Faculty Member *
                </label>
                <select
                  name="staff_id"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.department} - {t.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue="Academic"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedSection(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SubmitButton label="Confirm Appointment" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
