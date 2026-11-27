"use client";

import { useState, useTransition } from "react";
import { saveFullRoutineGridAction } from "@/features/academic/routine-actions";
import type { ClassRoutineRecord } from "@/features/academic/types";
import type { StaffProfileRecord } from "@/features/staff/types";
import {
  PeriodSlot,
  DEFAULT_PERIODS,
  TIFFIN_BREAK,
  COLLEGE_DAYS,
  DEFAULT_ROUTINES_BY_GROUP,
  GROUP_SUBJECT_SUGGESTIONS,
} from "@/features/academic/routine-defaults";

interface GridCell {
  day: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  isPhysicalTraining: boolean;
  isPractical: boolean;
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

  // Period timings + tiffin break (all editable by admin)
  const [periodTimings, setPeriodTimings] = useState<PeriodSlot[]>(DEFAULT_PERIODS);
  const [tiffinStart, setTiffinStart] = useState<string>(TIFFIN_BREAK.defaultStart);
  const [tiffinEnd, setTiffinEnd] = useState<string>(TIFFIN_BREAK.defaultEnd);
  const [showTimingsModal, setShowTimingsModal] = useState(false);

  // Cell editor modal
  const [editingCell, setEditingCell] = useState<{
    day: string;
    periodNumber: number;
    subject: string;
    teacherName: string;
    isPhysicalTraining: boolean;
    isPractical: boolean;
    startTime: string;
    endTime: string;
  } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Build grid data
  const [cellMap, setCellMap] = useState<Record<string, GridCell>>(() => {
    return buildInitialGrid(initialRecords, selectedBatch, selectedGroup, DEFAULT_PERIODS);
  });

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
          const match = relevant.find(
            (r) =>
              r.day_of_week === day &&
              (r.sort_order === slot.number ||
                r.start_time?.slice(0, 5) === slot.defaultStart ||
                r.start_time?.slice(0, 2) === slot.defaultStart.slice(0, 2))
          );

          if (match) {
            const sub = match.subject || "";
            map[key] = {
              day,
              periodNumber: slot.number,
              startTime: match.start_time?.slice(0, 5) || slot.defaultStart,
              endTime: match.end_time?.slice(0, 5) || slot.defaultEnd,
              subject: sub,
              teacherName: match.teacher_name || "",
              isPhysicalTraining: Boolean(match.is_physical_training) || sub.toLowerCase().includes("physical training") || sub.toLowerCase().includes("(pt)"),
              isPractical: Boolean(match.is_practical) || sub.toLowerCase().includes("practical"),
            };
            continue;
          }
        }

        // Default routine pre-fill
        const defaultSubjects = DEFAULT_ROUTINES_BY_GROUP[group]?.[day] || [];
        const defaultSubject = defaultSubjects[slot.number - 1] || "";
        const isPT = defaultSubject.toLowerCase().includes("physical training") || defaultSubject.toLowerCase().includes("(pt)");
        const isPrac = defaultSubject.toLowerCase().includes("practical");

        map[key] = {
          day,
          periodNumber: slot.number,
          startTime: slot.defaultStart,
          endTime: slot.defaultEnd,
          subject: defaultSubject,
          teacherName: "",
          isPhysicalTraining: isPT,
          isPractical: isPrac,
        };
      }
    }

    return map;
  }

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
      isPractical: false,
    };

    setEditingCell({
      day,
      periodNumber: slot.number,
      subject: cell.subject,
      teacherName: cell.teacherName,
      isPhysicalTraining: cell.isPhysicalTraining,
      isPractical: cell.isPractical,
      startTime: cell.startTime,
      endTime: cell.endTime,
    });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const key = `${editingCell.day}-${editingCell.periodNumber}`;
    const sub = editingCell.subject.trim();
    const isPT = editingCell.isPhysicalTraining || sub.toLowerCase().includes("physical training") || sub.toLowerCase().includes("(pt)");
    const isPrac = editingCell.isPractical || sub.toLowerCase().includes("practical");

    setCellMap((prev) => ({
      ...prev,
      [key]: {
        day: editingCell.day,
        periodNumber: editingCell.periodNumber,
        startTime: editingCell.startTime,
        endTime: editingCell.endTime,
        subject: sub,
        teacherName: editingCell.teacherName,
        isPhysicalTraining: isPT,
        isPractical: isPrac,
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
        isPractical: false,
      },
    }));
    setEditingCell(null);
  };

  const handleResetToDefault = () => {
    if (!confirm(`Reset timetable to default 7-period schedule with tiffin break for ${selectedGroup.toUpperCase()}?`)) return;
    const map: Record<string, GridCell> = {};
    for (const day of COLLEGE_DAYS) {
      for (const slot of periodTimings) {
        const key = `${day}-${slot.number}`;
        const defaultSubjects = DEFAULT_ROUTINES_BY_GROUP[selectedGroup]?.[day] || [];
        const defaultSubject = defaultSubjects[slot.number - 1] || "";
        const isPT = defaultSubject.toLowerCase().includes("physical training") || defaultSubject.toLowerCase().includes("(pt)");
        const isPrac = defaultSubject.toLowerCase().includes("practical");
        map[key] = {
          day,
          periodNumber: slot.number,
          startTime: slot.defaultStart,
          endTime: slot.defaultEnd,
          subject: defaultSubject,
          teacherName: "",
          isPhysicalTraining: isPT,
          isPractical: isPrac,
        };
      }
    }
    setCellMap(map);
    showToast("success", "Loaded default 7-period routine table. Click 'Save Full Routine' to commit.");
  };

  const handleSaveFullRoutine = async (publish: boolean = true) => {
    startTransition(async () => {
      const itemsToSave = Object.values(cellMap).map((c) => ({
        day_of_week: c.day,
        start_time: c.startTime,
        end_time: c.endTime,
        subject: c.subject,
        teacher_name: c.teacherName || null,
        is_physical_training: c.isPhysicalTraining,
        is_practical: c.isPractical,
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

  const handlePrint = () => {
    window.print();
  };

  // Group periods into before tiffin (1..3) and after tiffin (4..7)
  const periodsBeforeTiffin = periodTimings.filter((p) => p.number <= 3);
  const periodsAfterTiffin = periodTimings.filter((p) => p.number > 3);

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
      <div className="print:hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">🔗</span>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-900">
              Timetable Connected to RFID Gate Attendance & Tiffin Recess
            </h2>
            <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
              • <strong>Arrival Check-in:</strong> 09:00 AM (Period 1 start). Late flag applies after 09:15 AM.<br />
              • <strong>Tiffin Recess:</strong> 11:15 AM – 11:45 AM (after Period 3).<br />
              • <strong>Regular Departure:</strong> Expected when regular theory classes end (e.g. 01:15 PM / 01:55 PM).<br />
              • <strong>🏃 PT & 🔬 Practical Exemption:</strong> Students leaving before or during PT / Practical classes are <strong>NOT flagged as left early</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            🖨️ Download PDF / Print
          </button>
          <button
            onClick={() => setShowTimingsModal(true)}
            className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-blue-800 hover:bg-blue-100/60 shadow-xs transition"
          >
            ⚙️ Period Times
          </button>
        </div>
      </div>

      {/* Top Filter & Action Bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
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

      {/* Printable Heading */}
      <div className="hidden print:block text-center py-2 border-b border-gray-200">
        <h1 className="text-xl font-black text-gray-900">HAJI RANGU MIAH DEGREE COLLEGE</h1>
        <p className="text-sm font-bold text-blue-800 mt-0.5">
          Weekly Academic Timetable — {selectedGroup.toUpperCase()} STREAM
        </p>
        <p className="text-xs text-gray-500">
          7 Periods Daily with Tiffin Break (11:15 AM – 11:45 AM)
        </p>
      </div>

      {/* Unified 7-Period Timetable Table with Tiffin Break */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs font-bold">
                <th className="px-3 py-3 border-r border-blue-600/50 w-24 uppercase tracking-wider">
                  Day
                </th>
                {/* Periods 1-3 */}
                {periodsBeforeTiffin.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-2 py-3 border-r border-blue-600/50 text-center min-w-[110px]"
                  >
                    <div className="font-extrabold">{slot.label}</div>
                    <div className="text-[10px] text-blue-200 font-mono font-normal">
                      {slot.defaultStart} – {slot.defaultEnd}
                    </div>
                  </th>
                ))}

                {/* Tiffin Break Column Header */}
                <th className="px-2 py-3 bg-amber-600 text-white text-center w-20 border-r border-amber-500">
                  <div className="font-black text-[11px]">☕ TIFFIN</div>
                  <div className="text-[9px] text-amber-100 font-mono whitespace-nowrap">{tiffinStart}–{tiffinEnd}</div>
                </th>
                {/* Periods 4-7 */}
                {periodsAfterTiffin.map((slot) => (
                  <th
                    key={slot.number}
                    className="px-2 py-3 border-r border-blue-600/50 text-center min-w-[110px] last:border-0"
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
                  <td className="px-3 py-3 bg-gray-50 font-black text-gray-900 border-r border-gray-200 whitespace-nowrap">
                    <div>{day}</div>
                    <div className="text-[10px] text-gray-500 font-normal">7 Periods</div>
                  </td>

                  {/* Periods 1 to 3 */}
                  {periodsBeforeTiffin.map((slot) => {
                    const key = `${day}-${slot.number}`;
                    const cell = cellMap[key];
                    const hasSubject = cell && cell.subject.trim().length > 0;

                    return (
                      <td
                        key={slot.number}
                        onClick={() => openCellEditor(day, slot)}
                        className={`px-2.5 py-2 border-r border-gray-200 cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-inset ${
                          cell?.isPhysicalTraining || cell?.isPractical
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
                                <span className="shrink-0 rounded bg-orange-100 text-orange-800 border border-orange-300 px-1 py-0.2 text-[9px] font-black">
                                  PT
                                </span>
                              )}
                              {cell.isPractical && (
                                <span className="shrink-0 rounded bg-teal-100 text-teal-800 border border-teal-300 px-1 py-0.2 text-[9px] font-black">
                                  Lab
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

                  {/* Tiffin Break Column Body */}
                  <td className="px-2 py-3 bg-amber-50/90 text-center border-r border-amber-200 whitespace-nowrap">
                    <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-tighter">
                      BREAK
                    </div>
                    <div className="text-[9px] text-amber-600 font-mono">{tiffinStart}–{tiffinEnd}</div>
                  </td>

                  {/* Periods 4 to 7 */}
                  {periodsAfterTiffin.map((slot) => {
                    const key = `${day}-${slot.number}`;
                    const cell = cellMap[key];
                    const hasSubject = cell && cell.subject.trim().length > 0;

                    return (
                      <td
                        key={slot.number}
                        onClick={() => openCellEditor(day, slot)}
                        className={`px-2.5 py-2 border-r border-gray-200 last:border-0 cursor-pointer transition-all hover:ring-2 hover:ring-blue-400 hover:ring-inset ${
                          cell?.isPhysicalTraining || cell?.isPractical
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
                                <span className="shrink-0 rounded bg-orange-100 text-orange-800 border border-orange-300 px-1 py-0.2 text-[9px] font-black">
                                  PT
                                </span>
                              )}
                              {cell.isPractical && (
                                <span className="shrink-0 rounded bg-teal-100 text-teal-800 border border-teal-300 px-1 py-0.2 text-[9px] font-black">
                                  Lab
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
      <div className="print:hidden rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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

              {/* PT & Practical Class Toggles */}
              <div className="space-y-2 rounded-xl border border-orange-200 bg-orange-50/70 p-3">
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
                      Card scans during PT will <strong>NOT</strong> count as leaving college early.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer pt-1 border-t border-orange-200/60">
                  <input
                    type="checkbox"
                    checked={editingCell.isPractical}
                    onChange={(e) => setEditingCell((p) => p ? { ...p, isPractical: e.target.checked } : null)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="font-bold text-teal-950 block">
                      🔬 Practical / Laboratory Class
                    </span>
                    <span className="text-[10px] text-teal-800 leading-tight block mt-0.5">
                      Exempt from theory checkout requirement: leaving before practical will <strong>NOT</strong> say left early.
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
                <h3 className="font-bold text-sm">Configure Period Timings & Tiffin Break</h3>
                <p className="text-xs text-blue-200">
                  Edit start/end times for all 7 periods and the Tiffin break below.
                </p>
              </div>
              <button
                onClick={() => setShowTimingsModal(false)}
                className="text-white hover:text-blue-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto text-xs">
              {periodTimings.map((slot, idx) => (
                <div key={slot.number} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/70">
                    <span className="font-bold text-gray-900 w-20">{slot.label}</span>
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

                  {/* Tiffin Break — editable, shown between Period 3 and Period 4 */}
                  {slot.number === 3 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                        <span>☕</span>
                        <span>Tiffin / Recess Break (after Period 3)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-amber-800 font-bold w-16">Break Start</span>
                        <input
                          type="time"
                          value={tiffinStart}
                          onChange={(e) => setTiffinStart(e.target.value)}
                          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-mono font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
                        />
                        <span className="text-amber-700 font-bold">to</span>
                        <input
                          type="time"
                          value={tiffinEnd}
                          onChange={(e) => setTiffinEnd(e.target.value)}
                          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-mono font-bold text-amber-900 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 italic">
                        Students are on break — RFID attendance is paused during this window.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPeriodTimings(DEFAULT_PERIODS);
                  setTiffinStart(TIFFIN_BREAK.defaultStart);
                  setTiffinEnd(TIFFIN_BREAK.defaultEnd);
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
                  showToast("success", "Period timings & tiffin break updated. Save & Publish to apply.");
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
