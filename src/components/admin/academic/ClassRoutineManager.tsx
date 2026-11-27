"use client";
import { useState, useTransition, useRef } from "react";
import { saveClassRoutineAction, deleteClassRoutineAction, publishRoutineGroupAction } from "@/features/academic/routine-actions";
import type { ClassRoutineRecord } from "@/features/academic/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STUDY_GROUPS = [
  { value: "science", label: "Science" },
  { value: "business_studies", label: "Business Studies" },
  { value: "humanities", label: "Humanities" },
];
const COLORS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#14B8A6", label: "Teal" },
];

interface Props {
  initialRecords: ClassRoutineRecord[];
  batches: { id: string; name: string }[];
}

type EditRow = Partial<ClassRoutineRecord> & { isNew?: boolean };

export default function ClassRoutineManager({ initialRecords, batches }: Props) {
  const [records, setRecords] = useState<ClassRoutineRecord[]>(initialRecords);
  const [selectedBatch, setSelectedBatch] = useState<string>(batches[0]?.id || "");
  const [selectedGroup, setSelectedGroup] = useState<string>("science");
  const [editRow, setEditRow] = useState<EditRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered view
  const filtered = records.filter(
    (r) =>
      (r.batch_id === selectedBatch || !r.batch_id) &&
      (r.study_group === selectedGroup || !r.study_group)
  );

  const byDay = DAYS.reduce<Record<string, ClassRoutineRecord[]>>((acc, d) => {
    acc[d] = filtered.filter((r) => r.day_of_week === d).sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  const handleSave = async () => {
    if (!editRow) return;
    const fd = new FormData();
    if (editRow.id) fd.append("id", editRow.id);
    fd.append("batch_id", selectedBatch || "");
    fd.append("study_group", selectedGroup || "");
    fd.append("day_of_week", editRow.day_of_week || "Sunday");
    fd.append("start_time", editRow.start_time || "09:00");
    fd.append("end_time", editRow.end_time || "10:00");
    fd.append("subject", editRow.subject || "");
    fd.append("teacher_name", editRow.teacher_name || "");
    fd.append("room_number", editRow.room_number || "");
    fd.append("is_physical_training", String(editRow.is_physical_training ?? false));
    fd.append("is_published", String(editRow.is_published ?? false));
    fd.append("color", editRow.color || "");

    startTransition(async () => {
      const result = await saveClassRoutineAction(null, fd);
      if (result?.success) {
        showToast("success", editRow.id ? "Updated successfully." : "Class period added.");
        setEditRow(null);
        // Re-fetch by triggering a reload-like behavior via router (we'll use window for SSR page)
        window.location.reload();
      } else {
        showToast("error", result?.error || "Save failed.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class period?")) return;
    setDeleting(id);
    const result = await deleteClassRoutineAction(id);
    setDeleting(null);
    if (result?.success) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Deleted.");
    } else {
      showToast("error", result?.error || "Delete failed.");
    }
  };

  const handlePublishToggle = async (is_published: boolean) => {
    startTransition(async () => {
      const result = await publishRoutineGroupAction(selectedBatch || null, selectedGroup || null, is_published);
      if (result?.success) {
        showToast("success", is_published ? "Routine published for students." : "Routine unpublished.");
        window.location.reload();
      } else {
        showToast("error", result?.error || "Failed.");
      }
    });
  };

  const isPublished = filtered.length > 0 && filtered.every((r) => r.is_published);

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-bold shadow-xl border ${toast.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Study Group</label>
          <div className="flex gap-1">
            {STUDY_GROUPS.map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGroup(g.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${selectedGroup === g.value ? "bg-blue-700 text-white border-blue-700 shadow" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <button
            onClick={() => handlePublishToggle(!isPublished)}
            disabled={isPending || filtered.length === 0}
            className={`rounded-lg px-4 py-2 text-xs font-bold border transition-all disabled:opacity-50 ${isPublished ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100" : "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"}`}
          >
            {isPublished ? "⚠️ Unpublish" : "✅ Publish to Students"}
          </button>
          <button
            onClick={() => setEditRow({ isNew: true, day_of_week: "Sunday", start_time: "09:00", end_time: "10:00", is_published: false, is_physical_training: false })}
            className="rounded-lg bg-blue-700 text-white px-4 py-2 text-xs font-bold hover:bg-blue-800 shadow"
          >
            + Add Period
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="text-base font-black text-gray-900">{editRow.id ? "Edit Class Period" : "Add Class Period"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-600">Day *</label>
                <select value={editRow.day_of_week || "Sunday"} onChange={(e) => setEditRow((p) => ({ ...p, day_of_week: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Subject *</label>
                <input type="text" value={editRow.subject || ""} onChange={(e) => setEditRow((p) => ({ ...p, subject: e.target.value }))} placeholder="e.g. Physics" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Start Time *</label>
                <input type="time" value={editRow.start_time || "09:00"} onChange={(e) => setEditRow((p) => ({ ...p, start_time: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">End Time *</label>
                <input type="time" value={editRow.end_time || "10:00"} onChange={(e) => setEditRow((p) => ({ ...p, end_time: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Teacher Name</label>
                <input type="text" value={editRow.teacher_name || ""} onChange={(e) => setEditRow((p) => ({ ...p, teacher_name: e.target.value }))} placeholder="Teacher name" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Room / Venue</label>
                <input type="text" value={editRow.room_number || ""} onChange={(e) => setEditRow((p) => ({ ...p, room_number: e.target.value }))} placeholder="e.g. Room 101" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Card Color</label>
                <select value={editRow.color || ""} onChange={(e) => setEditRow((p) => ({ ...p, color: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Default</option>
                  {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!editRow.is_physical_training} onChange={(e) => setEditRow((p) => ({ ...p, is_physical_training: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                  <span className="text-xs font-bold text-gray-700">🏃 Physical Training (PT)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditRow(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="rounded-lg bg-blue-700 text-white px-5 py-2 text-xs font-bold hover:bg-blue-800 disabled:opacity-50 shadow">
                {isPending ? "Saving…" : editRow.id ? "Update" : "Add Period"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-bold text-gray-900">No routine yet for this batch/group.</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Period" to build the weekly timetable.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayRecords = byDay[day];
            if (dayRecords.length === 0) return null;
            return (
              <div key={day} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                <div className="bg-blue-700 px-5 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">{day}</h3>
                  <button
                    onClick={() => setEditRow({ isNew: true, day_of_week: day, start_time: "09:00", end_time: "10:00", is_published: false, is_physical_training: false })}
                    className="text-xs font-bold text-blue-200 hover:text-white"
                  >
                    + Add
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Subject</th>
                        <th className="px-4 py-2">Teacher</th>
                        <th className="px-4 py-2">Room</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dayRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 font-mono font-bold text-gray-900 whitespace-nowrap">
                            {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-gray-900">
                            {r.color && <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: r.color }} />}
                            {r.subject}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{r.teacher_name || "—"}</td>
                          <td className="px-4 py-2.5 text-gray-500">{r.room_number || "—"}</td>
                          <td className="px-4 py-2.5">
                            {r.is_physical_training && (
                              <span className="rounded-full bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-[10px] font-bold">🏃 PT</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.is_published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"}`}>
                              {r.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditRow({ ...r })} className="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit</button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deleting === r.id}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs disabled:opacity-50"
                              >
                                {deleting === r.id ? "…" : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
