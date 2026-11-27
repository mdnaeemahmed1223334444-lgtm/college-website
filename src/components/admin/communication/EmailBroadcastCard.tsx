"use client";

import { useState } from "react";
import type { BatchRecord, StudentRecord } from "@/features/students/types";

interface Props {
  batches: BatchRecord[];
  students?: StudentRecord[];
  defaultEnabled?: boolean;
  typeLabel?: string;
}

export default function EmailBroadcastCard({
  batches,
  students = [],
  defaultEnabled = true,
  typeLabel = "Notice",
}: Props) {
  const [sendEmail, setSendEmail] = useState(defaultEnabled);
  const [target, setTarget] = useState<string>("all");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("all_running");
  const [selectedMajor, setSelectedMajor] = useState<string>("all");
  const [includeAlumni, setIncludeAlumni] = useState(false);

  // Student selection
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [showStudentList, setShowStudentList] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Dynamic additional emails
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (s.status !== "active" && !includeAlumni) return false;

    // Batch filter
    if (selectedBatchId && selectedBatchId !== "all" && selectedBatchId !== "all_running") {
      if (s.batch_id !== selectedBatchId) return false;
    }

    // Major filter
    const effectiveMajor =
      selectedMajor !== "all"
        ? selectedMajor
        : target === "science"
        ? "science"
        : target === "business_studies"
        ? "business_studies"
        : target === "humanities"
        ? "humanities"
        : null;

    if (effectiveMajor && s.study_group !== effectiveMajor) {
      return false;
    }

    // Search query
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = s.full_name?.toLowerCase().includes(q);
      const matchCode = s.student_code?.toLowerCase().includes(q);
      const matchRoll = String(s.roll || "").includes(q);
      if (!matchName && !matchCode && !matchRoll) return false;
    }

    return true;
  });

  const selectedCount = filteredStudents.filter((s) => !deselectedIds.has(s.id)).length;

  const toggleStudent = (id: string) => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      for (const s of filteredStudents) next.delete(s.id);
      return next;
    });
  };

  const handleDeselectAll = () => {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      for (const s of filteredStudents) next.add(s.id);
      return next;
    });
  };

  const handleAddEmail = () => {
    setAdditionalEmails((prev) => [...prev, ""]);
  };

  const handleUpdateEmail = (idx: number, val: string) => {
    setAdditionalEmails((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleRemoveEmail = (idx: number) => {
    setAdditionalEmails((prev) => prev.filter((_, i) => i !== idx));
  };

  const shouldShowStudents =
    target === "students" ||
    target === "batch" ||
    target === "science" ||
    target === "business_studies" ||
    target === "humanities" ||
    target === "all";

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 sm:p-5 space-y-4">
      {/* Hidden inputs for deselected student IDs */}
      {Array.from(deselectedIds).map((id) => (
        <input key={id} type="hidden" name="email_excluded_student_ids" value={id} />
      ))}

      {/* Main Checkbox Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer font-bold text-sm text-purple-950">
          <input
            type="checkbox"
            name="send_email"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <span>📧 Broadcast this {typeLabel} via Email (Brevo)</span>
        </label>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-200/80 text-purple-800 font-bold">
          Campus Mailer
        </span>
      </div>

      {sendEmail && (
        <div className="pt-3 border-t border-purple-200/60 space-y-4 text-xs">
          {/* Target Audience & Major Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Recipient Group
              </label>
              <select
                name="email_target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded border border-purple-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-purple-600 focus:outline-none"
              >
                <option value="all">🌐 Entire Campus (Running Students & Teachers)</option>
                <option value="students">🎓 Students Only</option>
                <option value="science">🔬 Science Students Only</option>
                <option value="business_studies">💼 Business Studies Only</option>
                <option value="humanities">🎨 Humanities Students Only</option>
                <option value="teachers">👨‍🏫 Teachers Only</option>
                <option value="batch">👥 Specific Batch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Major / Group Filter
              </label>
              <select
                name="email_study_group"
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full rounded border border-purple-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-purple-600 focus:outline-none"
              >
                <option value="all">All Majors (Science, Business, Humanities)</option>
                <option value="science">🔬 Science</option>
                <option value="business_studies">💼 Business Studies</option>
                <option value="humanities">🎨 Humanities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-950 mb-1">
                Batch / Year
              </label>
              <select
                name="email_batch_id"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full rounded border border-purple-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-purple-600 focus:outline-none"
              >
                <option value="all_running">All Running Batches (Both 1st & 2nd Year)</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.status === "running" ? "Running" : "Passed"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Student Checklist & Deselection */}
          {shouldShowStudents && students.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-white p-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-purple-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-950">
                    👥 Students in this audience:
                  </span>
                  <span className="rounded-full bg-purple-700 px-2 py-0.5 text-[11px] font-extrabold text-white">
                    {selectedCount} selected / {filteredStudents.length} total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="rounded bg-purple-50 border border-purple-200 px-2 py-0.5 text-[11px] font-semibold text-purple-800 hover:bg-purple-100"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="rounded bg-gray-50 border border-gray-300 px-2 py-0.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStudentList(!showStudentList)}
                    className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 hover:bg-purple-200"
                  >
                    {showStudentList ? "Hide List ▲" : "View / Uncheck Students ▼"}
                  </button>
                </div>
              </div>

              {showStudentList && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name or roll..."
                    className="w-full rounded border border-purple-200 px-2.5 py-1 text-xs text-gray-800 focus:outline-none"
                  />
                  <div className="max-h-48 overflow-y-auto rounded border border-purple-100 p-2 space-y-1">
                    {filteredStudents.length === 0 ? (
                      <p className="text-gray-400 text-center py-2">No students match filter.</p>
                    ) : (
                      filteredStudents.map((s) => {
                        const isDeselected = deselectedIds.has(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center justify-between p-1 rounded cursor-pointer text-[11px] transition ${
                              isDeselected ? "bg-gray-50 text-gray-400 line-through" : "hover:bg-purple-50 text-gray-900"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!isDeselected}
                                onChange={() => toggleStudent(s.id)}
                                className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                              />
                              <span className="font-semibold">{s.full_name}</span>
                              <span className="text-gray-500 font-mono">({s.student_code} • Roll {s.roll})</span>
                            </div>
                            <span className="text-gray-500">{s.email}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Emails (Click to add dynamic row) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-purple-950">
                Additional Recipient Emails
              </label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 hover:bg-purple-200"
              >
                + Add Additional Email
              </button>
            </div>

            {additionalEmails.length > 0 && (
              <div className="space-y-1.5">
                {additionalEmails.map((emailVal, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="email"
                      name="email_additional"
                      value={emailVal}
                      onChange={(e) => handleUpdateEmail(idx, e.target.value)}
                      placeholder="e.g. guest@example.com"
                      className="w-full sm:w-72 rounded border border-purple-200 bg-white px-2.5 py-1 text-xs text-gray-800 focus:border-purple-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      className="text-gray-400 hover:text-red-600 font-bold px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exclude / Block Specific IDs */}
          <div>
            <label className="block text-xs font-bold text-red-950 mb-0.5">
              🚫 Exclude specific IDs or Emails for this announcement
            </label>
            <input
              name="email_excluded"
              placeholder="e.g. STU-2027-3001, blocked@example.com"
              className="w-full rounded border border-red-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-red-700/80 mt-0.5">
              These recipients will not receive this announcement email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
