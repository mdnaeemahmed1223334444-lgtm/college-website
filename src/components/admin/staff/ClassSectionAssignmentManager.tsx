"use client";

import { useState } from "react";
import Link from "next/link";
import type { StaffProfileRecord } from "@/features/staff/types";
import {
  saveStaffAssignmentsAction,
  assignSectionSubjectAction,
  removeSectionSubjectAction,
} from "@/features/staff/actions";
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

const COMMON_SUBJECTS: Record<string, string[]> = {
  Science: [
    "Physics 1st Paper",
    "Physics 2nd Paper",
    "Chemistry 1st Paper",
    "Chemistry 2nd Paper",
    "Biology 1st Paper",
    "Biology 2nd Paper",
    "Higher Mathematics 1st Paper",
    "Higher Mathematics 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "Information & Communication Tech (ICT)",
  ],
  "Business Studies": [
    "Accounting 1st Paper",
    "Accounting 2nd Paper",
    "Business Organization & Management 1st Paper",
    "Business Organization & Management 2nd Paper",
    "Finance, Banking & Insurance 1st Paper",
    "Finance, Banking & Insurance 2nd Paper",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "Information & Communication Tech (ICT)",
  ],
  Humanities: [
    "History 1st Paper",
    "History 2nd Paper",
    "Islamic History & Culture 1st Paper",
    "Islamic History & Culture 2nd Paper",
    "Civics & Good Governance 1st Paper",
    "Civics & Good Governance 2nd Paper",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Social Work 1st Paper",
    "Social Work 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "Information & Communication Tech (ICT)",
  ],
};

export default function ClassSectionAssignmentManager({
  teachers,
}: {
  teachers: StaffProfileRecord[];
}) {
  const [selectedSectionForClassTeacher, setSelectedSectionForClassTeacher] = useState<string | null>(null);
  const [selectedSectionForSubject, setSelectedSectionForSubject] = useState<{ code: string; group: string } | null>(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [teacherIdInput, setTeacherIdInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  async function handleAssignClassTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await saveStaffAssignmentsAction({}, form);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", res.message || "Class teacher appointed successfully.");
      setSelectedSectionForClassTeacher(null);
      window.location.reload();
    }
  }

  async function handleAddSubjectTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSectionForSubject || !subjectInput || !teacherIdInput) {
      showToast("error", "Please select a subject and a teacher.");
      return;
    }
    setIsPending(true);
    const res = await assignSectionSubjectAction(
      teacherIdInput,
      selectedSectionForSubject.code,
      subjectInput
    );
    setIsPending(false);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", res.message || "Subject teacher assigned successfully.");
      setSelectedSectionForSubject(null);
      setSubjectInput("");
      setTeacherIdInput("");
      window.location.reload();
    }
  }

  async function handleRemoveSubject(teacherId: string, sectionCode: string, subject: string) {
    if (!confirm(`Remove ${subject} assignment for this teacher?`)) return;
    setIsPending(true);
    const res = await removeSectionSubjectAction(teacherId, sectionCode, subject);
    setIsPending(false);
    if (res.error) {
      showToast("error", res.error);
    } else {
      showToast("success", "Subject assignment removed.");
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Class & Section Teacher Allocation</h1>
          <p className="text-xs text-gray-500 mt-1">
            Appoint Class Teachers (Mentors) and assign Subject Teachers for each section across Science, Business Studies, and Humanities.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/staff/subjects"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            📖 Subject Matrix
          </Link>
          <Link
            href="/admin/academic/routines"
            className="rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
          >
            📅 Class Routines
          </Link>
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-xl border p-4 text-sm font-bold flex items-center gap-2 ${
            msg.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {msg.type === "success" ? "✅" : "❌"} {msg.text}
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((sec) => {
          // Appointed Class Teacher
          const appointedMentor = teachers.find(
            (t) => t.is_class_teacher && t.class_teacher_section === sec.code
          );

          // Subject Teachers allocated to this section
          const subjectTeachersForSection: { teacher: StaffProfileRecord; subject: string }[] = [];
          for (const t of teachers) {
            const teachesInSec = t.assigned_classes?.some((c) => c.includes(sec.code) || sec.code.includes(c));
            if (teachesInSec && t.assigned_subjects) {
              for (const sub of t.assigned_subjects) {
                subjectTeachersForSection.push({ teacher: t, subject: sub });
              }
            }
          }

          return (
            <div
              key={sec.code}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      {sec.class}
                    </span>
                    <h2 className="font-extrabold text-gray-900 text-base">{sec.group}</h2>
                  </div>
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-black text-blue-800">
                    {sec.section}
                  </span>
                </div>

                {/* Class Teacher / Mentor Box */}
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Class Teacher (Mentor)
                    </span>
                    <button
                      onClick={() => setSelectedSectionForClassTeacher(sec.code)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900"
                    >
                      {appointedMentor ? "Change" : "Appoint"}
                    </button>
                  </div>
                  {appointedMentor ? (
                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-xs shadow-xs">
                        {appointedMentor.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">
                          {appointedMentor.full_name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {appointedMentor.department} ({appointedMentor.employee_id})
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 font-semibold mt-1">
                      ⚠️ No class teacher assigned
                    </div>
                  )}
                </div>

                {/* Assigned Subjects & Teachers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Subjects & Teachers ({subjectTeachersForSection.length})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSectionForSubject({ code: sec.code, group: sec.group });
                        setSubjectInput("");
                        setTeacherIdInput("");
                      }}
                      className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
                    >
                      + Add Subject
                    </button>
                  </div>

                  {subjectTeachersForSection.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                      No subjects allocated yet. Click "+ Add Subject" to assign.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {subjectTeachersForSection.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-gray-50/80 px-2.5 py-1.5 border border-gray-100 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold text-gray-900 block truncate">
                              {item.subject}
                            </span>
                            <span className="text-[10px] text-gray-500 truncate block">
                              👨‍🏫 {item.teacher.full_name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveSubject(item.teacher.id, sec.code, item.subject)}
                            className="text-gray-400 hover:text-rose-600 font-bold p-1"
                            title="Remove assignment"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedSectionForSubject({ code: sec.code, group: sec.group });
                    setSubjectInput("");
                    setTeacherIdInput("");
                  }}
                  className="w-full rounded-lg bg-blue-700 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
                >
                  + Add / Assign Subject Teacher
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Appoint Class Teacher */}
      {selectedSectionForClassTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-blue-700 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Appoint Class Teacher</h3>
                <p className="text-xs text-blue-200">{selectedSectionForClassTeacher}</p>
              </div>
              <button
                onClick={() => setSelectedSectionForClassTeacher(null)}
                className="text-white hover:text-blue-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignClassTeacher} className="p-5 space-y-4">
              <input type="hidden" name="is_class_teacher" value="true" />
              <input type="hidden" name="class_teacher_section" value={selectedSectionForClassTeacher} />

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Select Faculty Member *
                </label>
                <select
                  name="staff_id"
                  required
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  defaultValue="Academic"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedSectionForClassTeacher(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <SubmitButton label="Confirm Appointment" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Subject Teacher to Section */}
      {selectedSectionForSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-blue-700 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Assign Subject Teacher</h3>
                <p className="text-xs text-blue-200">{selectedSectionForSubject.code}</p>
              </div>
              <button
                onClick={() => setSelectedSectionForSubject(null)}
                className="text-white hover:text-blue-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubjectTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Physics 1st Paper, Accounting, etc."
                  list="suggested-subjects"
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <datalist id="suggested-subjects">
                  {(COMMON_SUBJECTS[selectedSectionForSubject.group] || []).map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
                <p className="text-[11px] text-gray-500 mt-1">
                  Type any subject or select from suggestions above.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Assign Teacher *
                </label>
                <select
                  required
                  value={teacherIdInput}
                  onChange={(e) => setTeacherIdInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedSectionForSubject(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-blue-700 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50 shadow-xs"
                >
                  {isPending ? "Assigning…" : "Assign Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
