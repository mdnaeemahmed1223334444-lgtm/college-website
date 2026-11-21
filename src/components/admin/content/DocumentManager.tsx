"use client";

import { useActionState, useState } from "react";
import { saveDocumentAction, deleteDocumentAction } from "@/features/content/actions";
import type { DocumentRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import FileUploadInput from "@/components/shared/FileUploadInput";

export default function DocumentManager({ documents }: { documents: DocumentRecord[] }) {
  const [editing, setEditing] = useState<DocumentRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveDocumentAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;
    const res = await deleteDocumentAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Document "${title}" removed.`);
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
              {editing ? `Edit Document: ${editing.title}` : "Upload / Link New Downloadable Document"}
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
                <label className="block text-xs font-semibold text-gray-700">Document Title *</label>
                <input
                  name="title"
                  defaultValue={editing?.title || ""}
                  required
                  placeholder="e.g. HSC Board Syllabus 2026 (Science)"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Category</label>
                <select
                  name="category"
                  defaultValue={editing?.category || "General Forms"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Academic">Academic</option>
                  <option value="Admission">Admission</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="General Forms">General Forms</option>
                  <option value="Policies">Policies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">File Type</label>
                <input
                  name="file_type"
                  defaultValue={editing?.file_type || "PDF"}
                  placeholder="PDF, DOCX, ZIP"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <FileUploadInput
                  name="file_url"
                  label="File / Document Upload *"
                  defaultValue={editing?.file_url || ""}
                  folder="documents"
                  helperText="Upload the document directly from your computer. PDF, Word, ZIP, images all accepted (up to 10MB)."
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,image/*"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">File Size (e.g. 2.4 MB)</label>
                <input
                  name="file_size"
                  defaultValue={editing?.file_size || ""}
                  placeholder="e.g. 2.4 MB"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                defaultChecked={editing?.is_active ?? true}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-xs font-medium text-gray-700">
                Active & Visible on Public Documents Page
              </label>
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
              <SubmitButton label={editing ? "Update Document" : "Save Document"} />
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">All Downloadable Documents ({documents.length})</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Add Document
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">File Format & Size</th>
              <th className="px-4 py-3">Downloads</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">{doc.title}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
                    {doc.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px]">
                  {doc.file_type} {doc.file_size ? `(${doc.file_size})` : ""}
                </td>
                <td className="px-4 py-3 font-mono text-gray-500">{doc.downloads_count}</td>
                <td className="px-4 py-3">
                  {doc.is_active ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditing(doc);
                    }}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.title)}
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
