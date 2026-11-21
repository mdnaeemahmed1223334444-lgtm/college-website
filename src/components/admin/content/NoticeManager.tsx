"use client";

import { useActionState, useState } from "react";
import { saveNoticeAction, deleteNoticeAction } from "@/features/content/actions";
import type { NoticeRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";

export default function NoticeManager({ notices }: { notices: NoticeRecord[] }) {
  const [editing, setEditing] = useState<NoticeRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formatType, setFormatType] = useState<"none" | "pdf" | "image" | "word">("none");
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveNoticeAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const categories = ["all", "Academic", "Admission", "Examination", "General", "Administrative"];

  const filtered =
    selectedCategory === "all"
      ? notices
      : notices.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete the notice "${title}"?`)) return;
    const res = await deleteNoticeAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Notice "${title}" deleted.`);
  }

  function handleOpenCreate() {
    setEditing(null);
    setFormatType("none");
    setIsCreating(true);
  }

  function handleOpenEdit(n: NoticeRecord) {
    setIsCreating(false);
    setEditing(n);
    if (n.attachment_type === "pdf" || n.attachment_type === "image" || n.attachment_type === "word") {
      setFormatType(n.attachment_type);
    } else if (n.attachment_url) {
      const lower = n.attachment_url.toLowerCase();
      if (lower.endsWith(".pdf")) setFormatType("pdf");
      else if (lower.endsWith(".jpg") || lower.endsWith(".png") || lower.endsWith(".jpeg") || lower.endsWith(".webp")) setFormatType("image");
      else if (lower.endsWith(".doc") || lower.endsWith(".docx")) setFormatType("word");
      else setFormatType("pdf");
    } else {
      setFormatType("none");
    }
  }

  const showEditor = Boolean(editing || isCreating);
  const now = new Date();

  return (
    <div className="space-y-6">
      {deleteMsg && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {deleteMsg}
        </div>
      )}

      {/* Editor Modal / Form */}
      {showEditor && (
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {editing ? `✏️ Edit Notice: ${editing.title}` : "📢 Publish New Notice"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setIsCreating(false);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              ✕ Close
            </button>
          </div>

          <FeedbackAlert state={state} />

          <form action={formAction} className="space-y-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            {editing?.slug && <input type="hidden" name="slug" value={editing.slug} />}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Notice Title / Headline <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-1">Clear headline students and parents will see</p>
              <input
                name="title"
                defaultValue={editing?.title || ""}
                required
                placeholder="e.g. HSC 2nd Year Pre-Board Examination Schedule 2026"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800">Category</label>
                <p className="text-xs text-gray-500 mb-1">Choose the type of notice</p>
                <select
                  name="category"
                  defaultValue={editing?.category || "General"}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Academic">Academic</option>
                  <option value="Admission">Admission</option>
                  <option value="Examination">Examination</option>
                  <option value="General">General</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">Status</label>
                <p className="text-xs text-gray-500 mb-1">Publish now or keep as draft</p>
                <select
                  name="status"
                  defaultValue={editing?.status || "published"}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="published">Published (Visible on website)</option>
                  <option value="draft">Draft (Saved, not visible yet)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Notice Format / Attachment Picker */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 space-y-3">
              <div>
                <label className="block text-sm font-bold text-blue-900">
                  📎 Notice Format / Attachment Type
                </label>
                <p className="text-xs text-blue-700 mt-0.5">
                  Does this notice have an attached PDF file, picture, Word file, or text only?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setFormatType("none")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    formatType === "none"
                      ? "border-blue-600 bg-blue-600 text-white font-bold shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📝</span>
                  <span className="text-xs mt-1">Text Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatType("pdf")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    formatType === "pdf"
                      ? "border-blue-600 bg-blue-600 text-white font-bold shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📄</span>
                  <span className="text-xs mt-1">PDF File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatType("image")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    formatType === "image"
                      ? "border-blue-600 bg-blue-600 text-white font-bold shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">🖼️</span>
                  <span className="text-xs mt-1">Picture / Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormatType("word")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition ${
                    formatType === "word"
                      ? "border-blue-600 bg-blue-600 text-white font-bold shadow-xs"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">📘</span>
                  <span className="text-xs mt-1">Word Document</span>
                </button>
              </div>

              <input type="hidden" name="attachment_type" value={formatType} />

              {/* Attachment File Input if not text-only */}
              {formatType !== "none" && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-800">
                    {formatType === "pdf" && "PDF File URL or Path (.pdf)"}
                    {formatType === "image" && "Picture / Photo Image URL (.jpg, .png, .webp)"}
                    {formatType === "word" && "Word Document URL (.doc, .docx)"}
                  </label>
                  <input
                    name="attachment_url"
                    defaultValue={editing?.attachment_url || ""}
                    placeholder={
                      formatType === "pdf"
                        ? "e.g. /documents/routine-2026.pdf or https://..."
                        : formatType === "image"
                        ? "e.g. /images/notice-poster.jpg or https://..."
                        : "e.g. /documents/notice.docx or https://..."
                    }
                    className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    💡 You can paste a link, or use files uploaded in <strong>Media Uploads</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Expiration / Deadline Setting */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-2">
              <div>
                <label className="block text-sm font-bold text-amber-900">
                  ⏳ Notice Expiration Deadline (Optional)
                </label>
                <p className="text-xs text-amber-700 mt-0.5">
                  Set a date & time limit. <strong>After this deadline passes, this notice will be automatically deleted / hidden from the public website.</strong>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="datetime-local"
                  name="expires_at"
                  defaultValue={
                    editing?.expires_at
                      ? new Date(editing.expires_at).toISOString().slice(0, 16)
                      : ""
                  }
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-gray-500">
                  Leave blank if this notice should stay visible permanently.
                </span>
              </div>
            </div>

            {/* Plain Text Content Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Notice Details / Message
                </label>
                <span className="text-xs text-gray-400">
                  Press Enter for new lines — no HTML code required!
                </span>
              </div>
              <textarea
                name="content"
                rows={5}
                defaultValue={editing?.content || ""}
                placeholder="Type your notice description or instructions here..."
                className="w-full rounded border border-gray-300 p-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Pin and Urgent badges */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_pinned"
                  defaultChecked={editing?.is_pinned || false}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700">📌 Pin to Top of Notice List</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_urgent"
                  defaultChecked={editing?.is_urgent || false}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-sm font-semibold text-red-700">🚨 Mark as Urgent Notice</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <SubmitButton label={editing ? "💾 Update Notice" : "📢 Publish Notice"} />
            </div>
          </form>
        </div>
      )}

      {/* Header controls & filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCategory(c)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition ${
                selectedCategory === c
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 shrink-0"
        >
          + Publish New Notice
        </button>
      </div>

      {/* Notices Table */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Notice Title</th>
              <th className="px-4 py-3">Format</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Deadline / Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400 text-sm">
                  No notices found in this category.
                </td>
              </tr>
            ) : (
              filtered.map((n) => {
                const isExpired = n.expires_at ? new Date(n.expires_at) <= now : false;

                // Format detection
                let formatEmoji = "📝";
                let formatLabel = "Text";
                if (n.attachment_type === "pdf" || n.attachment_url?.endsWith(".pdf")) {
                  formatEmoji = "📄";
                  formatLabel = "PDF";
                } else if (
                  n.attachment_type === "image" ||
                  n.attachment_url?.match(/\.(jpg|jpeg|png|webp)$/i)
                ) {
                  formatEmoji = "🖼️";
                  formatLabel = "Picture";
                } else if (
                  n.attachment_type === "word" ||
                  n.attachment_url?.match(/\.(doc|docx)$/i)
                ) {
                  formatEmoji = "📘";
                  formatLabel = "Word Doc";
                }

                return (
                  <tr key={n.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-semibold text-gray-900 text-sm">{n.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {n.is_pinned && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                            📌 Pinned
                          </span>
                        )}
                        {n.is_urgent && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            🚨 Urgent
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {n.published_at ? new Date(n.published_at).toLocaleDateString() : "Just now"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        <span>{formatEmoji}</span>
                        <span>{formatLabel}</span>
                      </span>
                      {n.attachment_url && (
                        <a
                          href={n.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[11px] text-blue-600 hover:underline mt-0.5 truncate max-w-[120px]"
                        >
                          View file ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {n.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isExpired ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                            ⚠️ Expired (Auto-hidden)
                          </span>
                          <div className="text-[10px] text-gray-400">
                            Passed {new Date(n.expires_at!).toLocaleDateString()}
                          </div>
                        </div>
                      ) : n.expires_at ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                            ✓ Active
                          </span>
                          <div className="text-[10px] text-amber-700 font-medium">
                            ⏳ Ends {new Date(n.expires_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">
                          ✓ Permanent
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(n)}
                        className="font-semibold text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(n.id, n.title)}
                        className="font-semibold text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
