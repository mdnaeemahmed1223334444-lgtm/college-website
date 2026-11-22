"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { BatchRecord, StudentFeedback } from "@/features/students/types";
import { saveBatchAction, deleteBatchAction } from "@/features/students/actions";
import { SubmitButton } from "@/components/admin/website/FormControls";

interface BatchManagerProps {
  initialBatches: BatchRecord[];
}

export default function BatchManager({ initialBatches }: BatchManagerProps) {
  const [batches, setBatches] = useState<BatchRecord[]>(initialBatches);
  const [editingBatch, setEditingBatch] = useState<BatchRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    startTransition(async () => {
      const res = await deleteBatchAction(id);
      if (res.success) {
        setBatches((prev) => prev.filter((b) => b.id !== id));
        setFeedback({ type: "success", text: res.message || "Batch deleted." });
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to delete batch." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-lg p-4 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Academic Batches</h2>
          <p className="text-xs text-gray-500">
            HSC batches (e.g. HSC Batch 26, HSC Batch 27) that group students by exam year.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/students/list"
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            ← Student Directory
          </Link>
          <button
            onClick={() => {
              setEditingBatch(null);
              setIsModalOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create New Batch</span>
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{batch.name}</h3>
                  <p className="text-xs text-gray-500">Exam Year: {batch.exam_year}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    batch.status === "running"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {batch.status === "running" ? "● Running" : "● Passed"}
                </span>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Level:</span>
                  <span className="font-semibold text-gray-900">
                    {batch.current_year === "second_year"
                      ? "2nd Year (XII)"
                      : batch.current_year === "first_year"
                      ? "1st Year (XI)"
                      : "Completed"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex items-center justify-between">
              <Link
                href={`/admin/students/list`}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View Students →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingBatch(batch);
                    setIsModalOpen(true);
                  }}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(batch.id, batch.name)}
                  disabled={isPending}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between border-b px-5 py-4 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900">
                {editingBatch ? `Edit Batch: ${editingBatch.name}` : "Create New Batch"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBatch(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                const res = await saveBatchAction({}, formData);
                if (res.success) {
                  setIsModalOpen(false);
                  setEditingBatch(null);
                  window.location.reload();
                } else {
                  setFeedback({ type: "error", text: res.error || "Failed to save batch." });
                }
              }}
              className="p-5 space-y-4"
            >
              {editingBatch?.id && <input type="hidden" name="id" value={editingBatch.id} />}

              <div>
                <label className="block text-xs font-bold text-gray-800">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingBatch?.name || ""}
                  placeholder="e.g. HSC Batch 27"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">
                  Exam Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="exam_year"
                  required
                  min={2000}
                  max={2100}
                  defaultValue={editingBatch?.exam_year || new Date().getFullYear() + 1}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">Batch Status</label>
                <select
                  name="status"
                  defaultValue={editingBatch?.status || "running"}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="running">Running (Active)</option>
                  <option value="passed">Passed Out (Alumni)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800">Current Academic Year</label>
                <select
                  name="current_year"
                  defaultValue={editingBatch?.current_year || "first_year"}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="first_year">1st Year (Class XI)</option>
                  <option value="second_year">2nd Year (Class XII)</option>
                </select>
              </div>

              <div className="flex justify-end pt-3 border-t gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <SubmitButton label={editingBatch ? "Update Batch" : "Create Batch"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
