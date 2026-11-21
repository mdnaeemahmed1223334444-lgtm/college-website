"use client";

import { useActionState, useState } from "react";
import { saveCareerCircularAction, deleteCareerCircularAction } from "@/features/content/actions";
import type { CareerCircularRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import FileUploadInput from "@/components/shared/FileUploadInput";

export default function CareerManager({ circulars }: { circulars: CareerCircularRecord[] }) {
  const [editing, setEditing] = useState<CareerCircularRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveCareerCircularAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;
    const res = await deleteCareerCircularAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Circular "${title}" deleted.`);
  }

  const showEditor = Boolean(editing || isCreating);

  return (
    <div className="space-y-6">
      {deleteMsg && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          {deleteMsg}
        </div>
      )}

      {showEditor && (
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {editing ? `Edit Circular: ${editing.title}` : "Publish New Job Opening"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>

          <FeedbackAlert state={state} />

          <form action={formAction} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700">Circular Title *</label>
                <input
                  name="title"
                  defaultValue={editing?.title || ""}
                  required
                  placeholder="e.g. Recruitment of Lecturer in English"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Designation / Post Name *</label>
                <input
                  name="post_name"
                  defaultValue={editing?.post_name || ""}
                  required
                  placeholder="e.g. Lecturer (English)"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Number of Vacancies</label>
                <input
                  name="vacancy"
                  type="number"
                  min={1}
                  defaultValue={editing?.vacancy || 1}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Employment Type</label>
                <select
                  name="employment_type"
                  defaultValue={editing?.employment_type || "Full-time"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Full-time">Full-time Regular</option>
                  <option value="Part-time">Part-time / Visiting</option>
                  <option value="Contractual">Contractual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Application Deadline *</label>
                <input
                  name="deadline"
                  type="date"
                  defaultValue={editing?.deadline || ""}
                  required
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <FileUploadInput
                  name="circular_file_url"
                  label="Circular PDF / Job Circular Download"
                  defaultValue={editing?.circular_file_url || ""}
                  folder="careers"
                  helperText="Upload the job circular PDF or document directly from your computer (PDF, Word, up to 10MB)."
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Status</label>
                <select
                  name="status"
                  defaultValue={editing?.status || "published"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Required Qualifications & Experience</label>
              <textarea
                name="requirements"
                rows={4}
                defaultValue={editing?.requirements || ""}
                placeholder="Degree qualifications, grade/GPA, experience details..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Application Instructions</label>
              <textarea
                name="application_instructions"
                rows={3}
                defaultValue={editing?.application_instructions || ""}
                placeholder="How to apply, documents required, email address..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="rounded border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <SubmitButton label={editing ? "Update Circular" : "Publish Opening"} />
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Open Career Circulars ({circulars.length})</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Post Vacancy
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Job Title & Post</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Vacancies</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {circulars.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{c.title}</div>
                  <div className="text-[11px] text-gray-500">{c.post_name}</div>
                </td>
                <td className="px-4 py-3 font-medium">{c.employment_type}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{c.vacancy}</td>
                <td className="px-4 py-3 font-mono text-red-600">{c.deadline}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      c.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditing(c);
                    }}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.title)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
