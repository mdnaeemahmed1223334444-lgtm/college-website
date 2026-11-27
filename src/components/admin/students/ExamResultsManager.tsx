"use client";
import { useState, useTransition, useActionState } from "react";
import { saveExamResultAction, deleteExamResultAction, togglePublishResultAction } from "@/features/results/actions";
import { computeGrade } from "@/features/results/types";

interface Student {
  id: string;
  full_name: string;
  student_code: string;
  batch_id: string | null;
  study_group: string | null;
  batch_name?: string;
}

interface ExamResult {
  id: string;
  student_id: string;
  exam_name: string;
  subject: string;
  total_marks: number;
  obtained_marks: number | null;
  grade: string | null;
  gpa: number | null;
  exam_date: string | null;
  academic_year: string | null;
  remarks: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  students?: Student;
}

interface Props {
  initialResults: ExamResult[];
  students: Student[];
}

const GRADES = ["A+", "A", "A-", "B", "C", "D", "F"];

export default function ExamResultsManager({ initialResults, students }: Props) {
  const [results, setResults] = useState<ExamResult[]>(initialResults);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [filterExam, setFilterExam] = useState<string>("");
  const [editItem, setEditItem] = useState<Partial<ExamResult> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [autoGrade, setAutoGrade] = useState(true);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // All exam names (deduplicated)
  const allExamNames = [...new Set(results.map((r) => r.exam_name))].sort();

  // Filtered results
  const filtered = results.filter((r) => {
    if (selectedStudentId && r.student_id !== selectedStudentId) return false;
    if (filterExam && r.exam_name !== filterExam) return false;
    return true;
  });

  // Student lookup
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const handleSave = async () => {
    if (!editItem || !editItem.student_id || !editItem.exam_name || !editItem.subject) {
      showToast("error", "Student, exam name, and subject are required.");
      return;
    }
    const fd = new FormData();
    if (editItem.id) fd.append("id", editItem.id);
    fd.append("student_id", editItem.student_id);
    const student = studentMap.get(editItem.student_id);
    if (student?.batch_id) fd.append("batch_id", student.batch_id);
    fd.append("exam_name", editItem.exam_name);
    fd.append("subject", editItem.subject);
    fd.append("total_marks", String(editItem.total_marks ?? 100));
    fd.append("obtained_marks", editItem.obtained_marks != null ? String(editItem.obtained_marks) : "");
    fd.append("exam_date", editItem.exam_date || "");
    fd.append("academic_year", editItem.academic_year || "");
    fd.append("remarks", editItem.remarks || "");
    fd.append("is_published", String(editItem.is_published ?? false));
    fd.append("created_by", "admin");

    if (!autoGrade && editItem.grade) {
      fd.append("grade", editItem.grade);
      fd.append("gpa", String(editItem.gpa ?? ""));
    }

    startTransition(async () => {
      const result = await saveExamResultAction(null, fd);
      if (result?.success) {
        showToast("success", editItem.id ? "Result updated." : "Result added.");
        setEditItem(null);
        window.location.reload();
      } else {
        showToast("error", result?.error || "Save failed.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this result?")) return;
    setDeleting(id);
    const result = await deleteExamResultAction(id);
    setDeleting(null);
    if (result?.success) {
      setResults((prev) => prev.filter((r) => r.id !== id));
      showToast("success", "Deleted.");
    } else {
      showToast("error", result?.error || "Failed.");
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const result = await togglePublishResultAction(id, !current);
    if (result?.success) {
      setResults((prev) => prev.map((r) => r.id === id ? { ...r, is_published: !current } : r));
      showToast("success", !current ? "Published to student." : "Unpublished.");
    } else {
      showToast("error", result?.error || "Failed.");
    }
  };

  const computedGrade = editItem?.obtained_marks != null && autoGrade
    ? computeGrade(Number(editItem.obtained_marks), Number(editItem.total_marks ?? 100))
    : null;

  const gradeColor = (grade?: string | null) => {
    switch (grade) {
      case "A+": return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "A": return "bg-green-100 text-green-800 border-green-300";
      case "A-": return "bg-teal-100 text-teal-800 border-teal-300";
      case "B": return "bg-blue-100 text-blue-800 border-blue-300";
      case "C": return "bg-amber-100 text-amber-800 border-amber-300";
      case "D": return "bg-orange-100 text-orange-800 border-orange-300";
      case "F": return "bg-rose-100 text-rose-800 border-rose-300";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-xl px-5 py-3 text-sm font-bold shadow-xl border ${toast.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-300 text-rose-800"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-end bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Filter by Student</label>
          <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[200px]">
            <option value="">All Students</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({s.student_code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Filter by Exam</label>
          <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[180px]">
            <option value="">All Exams</option>
            {allExamNames.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setEditItem({ is_published: false, total_marks: 100, student_id: selectedStudentId || "" })}
          className="rounded-lg bg-blue-700 text-white px-4 py-2 text-xs font-bold hover:bg-blue-800 shadow"
        >
          + Add Result
        </button>
      </div>

      {/* Add/Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl p-6 space-y-4 my-4">
            <h3 className="text-base font-black text-gray-900">{editItem.id ? "Edit Result" : "Add Exam Result"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-600">Student *</label>
                <select value={editItem.student_id || ""} onChange={(e) => setEditItem((p) => ({ ...p, student_id: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Select student…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.student_code} ({s.batch_name || ""})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Exam Name *</label>
                <input type="text" value={editItem.exam_name || ""} onChange={(e) => setEditItem((p) => ({ ...p, exam_name: e.target.value }))} placeholder="e.g. 1st Term Exam 2026" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" list="exam-names-list" />
                <datalist id="exam-names-list">
                  {allExamNames.map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Subject *</label>
                <input type="text" value={editItem.subject || ""} onChange={(e) => setEditItem((p) => ({ ...p, subject: e.target.value }))} placeholder="e.g. Physics" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Total Marks</label>
                <input type="number" value={editItem.total_marks ?? 100} onChange={(e) => setEditItem((p) => ({ ...p, total_marks: parseFloat(e.target.value) || 100 }))} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Obtained Marks</label>
                <input type="number" value={editItem.obtained_marks ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, obtained_marks: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="Leave blank if N/A" min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Exam Date</label>
                <input type="date" value={editItem.exam_date || ""} onChange={(e) => setEditItem((p) => ({ ...p, exam_date: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Academic Year</label>
                <input type="text" value={editItem.academic_year || ""} onChange={(e) => setEditItem((p) => ({ ...p, academic_year: e.target.value }))} placeholder="e.g. 2025-2026" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Auto-grade toggle */}
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={autoGrade} onChange={(e) => setAutoGrade(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                  <span className="text-xs font-bold text-gray-700">Auto-compute grade & GPA from marks</span>
                </label>
                {computedGrade && (
                  <p className="mt-1 text-xs text-blue-700">
                    → Computed: <strong>Grade {computedGrade.grade}</strong>, GPA <strong>{computedGrade.gpa}</strong>
                  </p>
                )}
              </div>

              {!autoGrade && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-600">Grade</label>
                    <select value={editItem.grade || ""} onChange={(e) => setEditItem((p) => ({ ...p, grade: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                      <option value="">—</option>
                      {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600">GPA</label>
                    <input type="number" step="0.01" min={0} max={5} value={editItem.gpa ?? ""} onChange={(e) => setEditItem((p) => ({ ...p, gpa: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="0.00–5.00" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                </>
              )}

              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-600">Remarks</label>
                <input type="text" value={editItem.remarks || ""} onChange={(e) => setEditItem((p) => ({ ...p, remarks: e.target.value }))} placeholder="Optional teacher notes" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="is_published_check" checked={!!editItem.is_published} onChange={(e) => setEditItem((p) => ({ ...p, is_published: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-emerald-600" />
                <label htmlFor="is_published_check" className="text-xs font-bold text-gray-700 cursor-pointer">Publish immediately (visible to student)</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditItem(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={isPending} className="rounded-lg bg-blue-700 text-white px-5 py-2 text-xs font-bold hover:bg-blue-800 disabled:opacity-50 shadow">
                {isPending ? "Saving…" : editItem.id ? "Update Result" : "Add Result"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-bold text-gray-900">No results found.</p>
          <p className="text-sm text-gray-500 mt-1">Use "Add Result" to enter exam marks for students.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">GPA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const student = studentMap.get(r.student_id) || r.students;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{student?.full_name || "Unknown"}</p>
                        <p className="text-gray-400 font-mono text-[10px]">{student?.student_code || r.student_id.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{r.exam_name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.subject}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">
                        {r.obtained_marks ?? "—"} / {r.total_marks}
                      </td>
                      <td className="px-4 py-3">
                        {r.grade ? (
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 font-bold text-xs ${gradeColor(r.grade)}`}>{r.grade}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-700">{r.gpa ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleTogglePublish(r.id, r.is_published)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border cursor-pointer hover:opacity-80 ${r.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-gray-100 text-gray-500 border-gray-200"}`}
                        >
                          {r.is_published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditItem({ ...r })} className="text-blue-600 hover:text-blue-800 font-bold">Edit</button>
                          <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="text-rose-500 hover:text-rose-700 font-bold disabled:opacity-50">
                            {deleting === r.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
