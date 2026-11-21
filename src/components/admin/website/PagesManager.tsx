"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { savePageAction, deletePageAction } from "@/features/website/actions";
import type { PageRecord, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function PagesManager({ pages }: { pages: PageRecord[] }) {
  const [editingPage, setEditingPage] = useState<PageRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [state, formAction] = useActionState<ActionFeedback, FormData>(savePageAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete the page "${title}"?`)) return;
    const res = await deletePageAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Page "${title}" deleted.`);
  }

  const showEditor = Boolean(editingPage || isCreating);

  return (
    <div className="space-y-6">
      {deleteMsg && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ {deleteMsg}
        </div>
      )}

      {/* Editor Section */}
      {showEditor ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-gray-900">
              {editingPage ? `✏️ Edit Page: ${editingPage.title}` : "➕ Create New Website Page"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingPage(null);
                setIsCreating(false);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              ✕ Close Editor
            </button>
          </div>

          <FeedbackAlert state={state} />

          <form action={formAction} className="space-y-4">
            {editingPage && <input type="hidden" name="id" value={editingPage.id} />}
            {editingPage?.slug && <input type="hidden" name="slug" value={editingPage.slug} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-1">What this page is called</p>
                <input
                  name="title"
                  defaultValue={editingPage?.title || ""}
                  required
                  placeholder="e.g. Science Laboratory Facilities"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">Publishing Status</label>
                <p className="text-xs text-gray-500 mb-1">Who can view this page</p>
                <select
                  name="status"
                  defaultValue={editingPage?.status || "published"}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="published">Visible to Public (Published)</option>
                  <option value="draft">Draft (Only Admin can see)</option>
                  <option value="archived">Archived (Hidden from everyone)</option>
                </select>
              </div>
            </div>

            {/* Optional SEO Collapse */}
            <div className="rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setShowSeo(!showSeo)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="text-xs font-bold text-gray-700">🔍 Google Search Preview (Optional)</span>
                <span className="text-xs text-gray-400 font-medium">{showSeo ? "▲ Hide" : "▼ Show"}</span>
              </button>

              {showSeo && (
                <div className="border-t p-3 space-y-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Search Result Title (Optional)</label>
                    <input
                      name="seo_title"
                      defaultValue={editingPage?.seo_title || ""}
                      placeholder="Defaults to Page Title"
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Search Result Snippet / Summary (Optional)</label>
                    <textarea
                      name="seo_description"
                      rows={2}
                      defaultValue={editingPage?.seo_description || ""}
                      placeholder="Brief 1-2 sentence description for Google..."
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-800">
                  Page Text / Content <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-400">Press Enter for new paragraphs (no HTML code needed!)</span>
              </div>
              <textarea
                name="content"
                rows={12}
                defaultValue={editingPage?.content || ""}
                placeholder="Write your page details here..."
                required
                className="w-full rounded border border-gray-300 p-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditingPage(null);
                  setIsCreating(false);
                }}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <SubmitButton label={editingPage ? "💾 Update Page" : "💾 Publish Page"} />
            </div>
          </form>
        </div>
      ) : null}

      {/* Pages Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            Published Pages ({pages.length})
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPage(null);
              setIsCreating(true);
            }}
            className="rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + Create New Page
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Page Title</th>
                <th className="px-4 py-3">Web Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id || p.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{p.title}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        p.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {p.status === "published" ? "✓ Published" : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link
                      href={`/${p.slug}`}
                      target="_blank"
                      className="text-gray-500 hover:text-blue-600 hover:underline font-medium"
                    >
                      View ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPage(p);
                      }}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.title)}
                      className="font-semibold text-red-600 hover:underline"
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
    </div>
  );
}
