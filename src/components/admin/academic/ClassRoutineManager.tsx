"use client";

import { useState, useTransition, useMemo } from "react";
import { saveFullRoutineGridAction, publishRoutineGroupAction } from "@/features/academic/routine-actions";
import type { ClassRoutineRecord } from "@/features/academic/types";
import type { StaffProfileRecord } from "@/features/staff/types";

export interface PeriodSlot {
  number: number;
  label: string;
  defaultStart: string;
  defaultEnd: string;
}

export const DEFAULT_PERIODS: PeriodSlot[] = [
  { number: 1, label: "Period 1", defaultStart: "09:00", defaultEnd: "09:45" },
  { number: 2, label: "Period 2", defaultStart: "09:45", defaultEnd: "10:30" },
  { number: 3, label: "Period 3", defaultStart: "10:30", defaultEnd: "11:15" },
  { number: 4, label: "Period 4", defaultStart: "11:15", defaultEnd: "12:00" },
  { number: 5, label: "Period 5", defaultStart: "12:00", defaultEnd: "12:45" },
  { number: 6, label: "Period 6", defaultStart: "12:45", defaultEnd: "13:30" },
  { number: 7, label: "Period 7", defaultStart: "13:30", defaultEnd: "14:10" },
];

export const COLLEGE_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export const DEFAULT_ROUTINES_BY_GROUP: Record<string, Record<string, string[]>> = {
  science: {
    Sunday: ["Physics 1st Paper", "Chemistry 1st Paper", "Higher Math 1st Paper", "Biology 1st Paper", "Bangla 1st Paper", "English 1st Paper", "ICT"],
    Monday: ["Chemistry 1st Paper", "Physics 1st Paper", "Biology 1st Paper", "Higher Math 1st Paper", "English 1st Paper", "Bangla 1st Paper", "Physics Practical"],
    Tuesday: ["Higher Math 1st Paper", "Biology 1st Paper", "Physics 1st Paper", "Chemistry 1st Paper", "ICT", "English 2nd Paper", "Chemistry Practical"],
    Wednesday: ["Biology 1st Paper", "Higher Math 1st Paper", "Chemistry 1st Paper", "Physics 1st Paper", "Bangla 2nd Paper", "English 2nd Paper", "Biology Practical"],
    Thursday: ["Physics 2nd Paper", "Chemistry 2nd Paper", "Biology 2nd Paper", "Higher Math 2nd Paper", "ICT Lab", "General Science Review", "Physical Training (PT)"],
  },
  business_studies: {
    Sunday: ["Accounting 1st Paper", "Business Organization", "Finance & Banking", "Economics 1st Paper", "Bangla 1st Paper", "English 1st Paper", "ICT"],
    Monday: ["Business Organization", "Accounting 1st Paper", "Economics 1st Paper", "Finance & Banking", "English 1st Paper", "Bangla 1st Paper", "Business Math"],
    Tuesday: ["Finance & Banking", "Economics 1st Paper", "Accounting 1st Paper", "Business Organization", "ICT", "English 2nd Paper", "Accounting Workshop"],
    Wednesday: ["Economics 1st Paper", "Finance & Banking", "Business Organization", "Accounting 1st Paper", "Bangla 2nd Paper", "English 2nd Paper", "Case Studies"],
    Thursday: ["Accounting 2nd Paper", "Business Org 2nd", "Finance 2nd Paper", "Economics 2nd Paper", "ICT Lab", "Career Guidance", "Physical Training (PT)"],
  },
  humanities: {
    Sunday: ["History 1st Paper", "Civics & Governance", "Economics 1st Paper", "Social Work 1st Paper", "Bangla 1st Paper", "English 1st Paper", "ICT"],
    Monday: ["Civics & Governance", "History 1st Paper", "Social Work 1st Paper", "Economics 1st Paper", "English 1st Paper", "Bangla 1st Paper", "General Studies"],
    Tuesday: ["Economics 1st Paper", "Social Work 1st Paper", "History 1st Paper", "Civics & Governance", "ICT", "English 2nd Paper", "Debate & Logic"],
    Wednesday: ["Social Work 1st Paper", "Economics 1st Paper", "Civics & Governance", "History 1st Paper", "Bangla 2nd Paper", "English 2nd Paper", "Literature & Culture"],
    Thursday: ["History 2nd Paper", "Civics 2nd Paper", "Economics 2nd Paper", "Social Work 2nd Paper", "ICT Practical", "Reading / Library", "Physical Training (PT)"],
  },
};

const GROUP_SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  science: [
    "Physics 1st Paper",
    "Physics 2nd Paper",
    "Physics Practical",
    "Chemistry 1st Paper",
    "Chemistry 2nd Paper",
    "Chemistry Practical",
    "Higher Math 1st Paper",
    "Higher Math 2nd Paper",
    "Biology 1st Paper",
    "Biology 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
  business_studies: [
    "Accounting 1st Paper",
    "Accounting 2nd Paper",
    "Business Organization",
    "Finance & Banking",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
  humanities: [
    "History 1st Paper",
    "History 2nd Paper",
    "Civics & Governance",
    "Economics 1st Paper",
    "Economics 2nd Paper",
    "Social Work 1st Paper",
    "Social Work 2nd Paper",
    "Bangla 1st Paper",
    "Bangla 2nd Paper",
    "English 1st Paper",
    "English 2nd Paper",
    "ICT",
    "Physical Training (PT)",
  ],
};

interface GridCell {
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  isPhysicalTraining: boolean;
  color?: string;
}

interface Props {
  initialRecords: ClassRoutineRecord[];
  batches: { id: string; name: string }[];
  teachers: StaffProfileRecord[];
}

export default function ClassRoutineManager({ initialRecords, batches, teachers }: Props) {
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || "");
  const [selectedGroup, setSelectedGroup] = useState<string>("science");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Custom period timings
  const [periodTimings, setPeriodTimings] = useState<PeriodSlot[]>(DEFAULT_PERIODS);
  const [showTimingsModal, setShowTimingsModal] = useState(false);

  // Modal for editing a specific cell
  const [editingCell, setEditingCell] = useState<{
    day: string;
    periodNumber: number;
    subject: string;
    teacherName: string;
    isPhysicalTraining: boolean;
    startTime: string;
    endTime: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Build grid data from database records or defaults
  const [cellMap, setCellMap] = useState<Record<string, GridCell>>(() => {
    return buildInitialGrid(initialRecords, selectedBatch, selectedGroup, DEFAULT_PERIODS);
  });

  // Switch batch or group
  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setCellMap(buildInitialGrid(initialRecords, selectedBatch, group, periodTimings));
  };

  const handleBatchChange = (batchId: string) => {
    setSelectedBatch(batchId);
    setCellMap(buildInitialGrid(initialRecords, batchId, selectedGroup, periodTimings));
  };

  function buildInitialGrid(
    records: ClassRoutineRecord[],
    batchId: string,
    group: string,
    periods: PeriodSlot[]
  ): Record<string, GridCell> {
    const map: Record<string, GridCell> = {};

    // Filter DB records for selected batch and group
    const relevant = records.filter(
      (r) =>
        (r.batch_id === batchId || !r.batch_id) &&
        (r.study_group === group || !r.study_group)
    );

    const hasDbData = relevant.length > 0;

    for (const day of COLLEGE_DAYS) {
      for (const slot of periods) {
        const key = `${day}-${slot.number}`;

        if (hasDbData) {
          // Find matching slot in DB records by day and matching time or sort_order
          const match = relevant.find(
            (r) =>
              r.day_of_week === day &&
              (r.sort_order === slot.number ||
                r.start_time?.slice(0, 5) === slot.defaultStart ||
                r.start_time?.slice(0, 2) === slot.defaultStart.slice(0, 2))
          );

          if (match) {
            map[key] = {
              day,
              periodNumber: slot.number,
              startTime: match.start_time?.slice(0, 5) || slot.defaultStart,
              endTime: match.end_time?.slice(0, 5) || slot.defaultEnd,
              subject: match.subject || "",
              teacherName: match.teacher_name || "",
              isPhysicalTraining: Boolean(match.is_physical_training),
              color: match.color || undefined,
            };
            continue;
          }
        }

        // Pre-fill with default routine table
        const defaultSubjects = DEFAULT_ROUTINES_BY_GROUP[group]?.[day] || [];
        const defaultSubject = defaultSubjects[slot.number - 1] || "";
        const isPT = defaultSubject.toLowerCase().includes("physical training") || defaultSubject.toLowerCase().includes("(pt)");

        map[key] = {
          day,
          periodNumber: slot.number,
          startTime: slot.defaultStart,
          endTime: slot.defaultEnd,
          subject: defaultSubject,
          teacherName: "",
          isPhysicalTraining: isPT,
        };
      }
    }

    return map;
  }

  // Handle cell click
  const openCellEditor = (day: string, slot: PeriodSlot) => {
    const key = `${day}-${slot.number}`;
    const cell = cellMap[key] || {
      day,
      periodNumber: slot.number,
      startTime: slot.defaultStart,
      endTime: slot.defaultEnd,
      subject: "",
      teacherName: "",
      isPhysicalTraining: false,
    };

    setEditingCell({
      day,
      periodNumber: slot.number,
      subject: cell.subject,
      teacherName: cell.teacherName,
      isPhysicalTraining: cell.isPhysicalTraining,
      startTime: cell.startTime,
      endTime: cell.endTime,
    });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.periodNumber}`;

    setCellMap((prev) => ({
      ...prev,
      [key]: {
        day: editingCell.day,
        periodNumber: editingCell.periodNumber,
        startTime: editingCell.startTime,
        endTime: editingCell.endTime,
        subject: editingCell.subject.trim(),
        teacherName: editingCell.teacherName,
        isPhysicalTraining: editingCell.isPhysicalTraining,
      },
    }));

    setEditingCell(null);
  };

  const handleClearCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.periodNumber}`;
    setCellMap((prev) => ({
      ...prev,
      [key]: {
        day: editingCell.day,
        periodNumber: editingCell.periodNumber,
        startTime: editingCell.startTime,
        endTime: editingCell.endTime,
        subject: "",
        teacherName: "",
        isPhysicalTraining: false,
      },
    }));
    setEditingCell(null);
  };

  // Reset to default 7-period routine table
  const handleResetToDefault = () => {
    if (!confirm(`Reset timetable to default 7-period schedule for ${selectedGroup.toUpperCase()}?`)) return;
    const map: Record<string, GridCell> = {};
    for (const day of COLLEGE_DAYS) {
      for (const slot of periodTimings) {
        const key = `${day}-${slot.number}`;
        const defaultSubjects = DEFAULT_ROUTINES_BY_GROUP[selectedGroup]?.[day] || [];
        const defaultSubject = defaultSubjects[slot.number - 1] || "";
        const isPT = defaultSubject.toLowerCase().includes("physical training") || defaultSubject.toLowerCase().includes("(pt)");
        map[key] = {
          day,
          periodNumber: slot.number,
          startTime: slot.defaultStart,
          endTime: slot.defaultEnd,
          subject: defaultSubject,
          teacherName: "",
          isPhysicalTraining: isPT,
        };
      }
    }
    setCellMap(map);
    showToast("success", "Loaded default 7-period routine table. Click 'Save Full Routine' to commit.");
  };

  // Save full routine to DB
  const handleSaveFullRoutine = async (publish: boolean = true) => {
    startTransition(async () => {
      const itemsToSave = Object.values(cellMap).map((c) => ({
        day_of_week: c.day,
        start_time: c.startTime,
        end_time: c.endTime,
        subject: c.subject,
        teacher_name: c.teacherName || null,
        is_physical_training: c.isPhysicalTraining,
        sort_order: c.periodNumber,
      }));

      const res = await saveFullRoutineGridAction(
        selectedBatch || null,
        selectedGroup || null,
        itemsToSave,
        publish
      );

      if (res?.success) {
        showToast(
          "success",
          publish
            ? "✅ 7-Period Routine saved & published to students! RFID attendance connected."
            : "✅ Routine saved as draft."
        );
      } else {
        showToast("error", res?.error || "Failed to save routine");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-bold shadow-2xl border ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Routine & Attendance Connection Notice */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🔗</span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900">
              Timetable Connected to RFID Gate Attendance
            </h2>
            <p className="text-xs text-blue-800 mt-0.5">
              • <strong>Arrival Check-in:</strong> 09:00 AM (Period 1 start). Scans after 09:15 AM are marked <strong>LATE</strong>.<br />
              • <strong>Departure Check-out:</strong> Expected at <strong>01:30 PM</strong> (after Period 6) or <strong>02:10 PM</strong> (after Period 7).<br />
              • <strong>🏃 Physical Training (PT):</strong> Excluded from exit calculation so student scans during PT are <strong>not counted as leaving college</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTimingsModal(true)}
            className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100/60 shadow-xs transition"
          >
            ⚙️ Edit Period Times
          </button>
        </div>
      </div>

      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          {/* Batch Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="rounded-xl border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Study Group Tabs */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
              Study Group
            </label>
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {[
                { key: "science", label: "🔬 Science" },
                { key: "business_studies", label: "💼 Business Studies" },
                { key: "humanities", label: "📖 Humanities" },
              ].map((g) => (
                <button
                  key={g.key}
                  onClick={() => handleGroupChange(g.key)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedGroup === g.key
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
            title="Reset this stream to standard 7-period schedule"
          >
            🔄 Reset to Default
          </button>
          <button
            onClick={() => handleSaveFullRoutine(true)}
            disabled={isPending}
            className="rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-md transition disabled:opacity-50"
          >
            {isPending ? "Saving Timetable…" : "💾 Save & Publish Routine"}
          </button>
        </div>
      </div>

      {/* 7-Period Timetable Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs font-bold">
                <th className="px-4 py-3 border-r border-blue-600/50 w-28 uppercase tracking-wider">
                  Day
                </th>
                {periodTimings.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-3 py-3 border-r border-blue-600/50 text-center min-w-[140px] last:border-0"
                  >
                    <div className="font-extrabold">{slot.label}</div>
                    <div className="text-[10px] text-blue-200 font-mono font-normal">
                      {slot.defaultStart} – {slot.defaultEnd}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {COLLEGE_DAYS.map((day) => (
                <tr key={day} className="hover:bg-blue-50/20 transition-colors">
                  {/* Day Column */}
                  <td className="px-4 py-3 bg-gray-50 font-black text-gray-900 border-r border-gray-200">
                    <div>{day}</div>
                    <div className="text-[10px] text-gray-500 font-normal">7 Periods</div>
                  </td>

                  {/* 7 Period Cells */}
                  {periodTimings.map((slot) => {
                    const key = `${day}-${slot.number}`;
                    const cell = cellMap[key];
                    const hasSubject = cell && cell.subject.trim().length > 0;

                    return (
                      <td
                        key={slot.number}
                        onClick={() => openCellEditor(day, slot)}
                        className={`px-2.5 py-2 border-r border-gray-200 last:border-0 cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-inset ${
                          cell?.isPhysicalTraining
                            ? "bg-orange-50/60"
                            : hasSubject
                            ? "bg-white"
                            : "bg-gray-50/40"
                        }`}
                      >
                        {hasSubject ? (
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-gray-900 leading-tight block">
                                {cell.subject}
                              </span>
                              {cell.isPhysicalTraining && (
                                <span className="shrink-0 rounded-full bg-orange-100 text-orange-800 border border-orange-300 px-1.5 py-0.5 text-[9px] font-black">
                                  PT
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                              {cell.teacherName ? (
                                <>
                                  <span>👨‍🏫</span>
                                  <span className="font-semibold text-gray-700 truncate">
                                    {cell.teacherName}
                                  </span>
                                </>
                              ) : (
                                <span className="text-amber-600 font-medium italic">
                                  No teacher assigned
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-2 text-center text-[11px] text-gray-400 font-medium hover:text-blue-600">
                            + Assign
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekend Off-Days Banner */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 flex items-center justify-between">
        <div>
          🎉 <strong>Friday & Saturday:</strong> Weekly College Holidays (Exempt from Attendance & Routines).
        </div>
        <div className="text-[11px] text-gray-500">
          💡 Click any cell in the table above to change the Subject or select a Teacher.
        </div>
      </div>

      {/* Edit Cell Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-blue-700 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Edit {editingCell.day} — Period {editingCell.periodNumber}
                </h3>
                <p className="text-xs text-blue-200 font-mono">
                  {editingCell.startTime} – {editingCell.endTime}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                className="text-white hover:text-blue-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Subject */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  value={editingCell.subject}
                  onChange={(e) => setEditingCell((p) => p ? { ...p, subject: e.target.value } : null)}
                  placeholder="e.g. Physics 1st Paper, ICT, etc."
                  list="subject-stream-list"
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none"
                />
                <datalist id="subject-stream-list">
                  {(GROUP_SUBJECT_SUGGESTIONS[selectedGroup] || []).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <p className="text-[10px] text-gray-400 mt-1">
                  Type any subject or pick from {selectedGroup} stream suggestions.
                </p>
              </div>

              {/* Teacher Selector Dropdown */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Select Teacher *
                </label>
                <select
                  value={editingCell.teacherName}
                  onChange={(e) => setEditingCell((p) => p ? { ...p, teacherName: e.target.value } : null)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Select teacher from list --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.full_name}>
                      {t.full_name} ({t.department} - {t.designation})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Choose from registered faculty members. No typing required.
                </p>
              </div>

              {/* PT Toggle */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCell.isPhysicalTraining}
                    onChange={(e) => setEditingCell((p) => p ? { ...p, isPhysicalTraining: e.target.checked } : null)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-bold text-orange-950 block">
                      🏃 Physical Training (PT) Class
                    </span>
                    <span className="text-[10px] text-orange-800 leading-tight block mt-0.5">
                      PT class will be shown in the student's routine, but RFID card scans during PT
                      will <strong>NOT</strong> count as leaving college.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClearCell}
                  className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                >
                  Clear Period
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="rounded-lg border border-gray-300 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCell}
                    className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
                  >
                    Update Cell
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Period Times Modal */}
      {showTimingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-blue-700 p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Configure 7 Periods Standard Timings</h3>
                <p className="text-xs text-blue-200">
                  Adjust start and end times for all 7 periods across the college routine.
                </p>
              </div>
              <button
                onClick={() => setShowTimingsModal(false)}
                className="text-white hover:text-blue-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              {periodTimings.map((slot, idx) => (
                <div
                  key={slot.number}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/70"
                >
                  <span className="font-bold text-gray-900 w-20">Period {slot.number}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.defaultStart}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPeriodTimings((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, defaultStart: val } : s))
                        );
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-mono font-bold"
                    />
                    <span className="text-gray-400 font-bold">to</span>
                    <input
                      type="time"
                      value={slot.defaultEnd}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPeriodTimings((prev) =>
                          prev.map((s, i) => (i === idx ? { ...s, defaultEnd: val } : s))
                        );
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPeriodTimings(DEFAULT_PERIODS);
                  setShowTimingsModal(false);
                }}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Reset to Standard
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTimingsModal(false);
                  showToast("success", "Period timings updated.");
                }}
                className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
              >
                Apply Timings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
