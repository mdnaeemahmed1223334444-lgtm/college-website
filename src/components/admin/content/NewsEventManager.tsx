"use client";

import { useActionState, useState } from "react";
import { saveNewsEventAction, deleteNewsEventAction } from "@/features/content/actions";
import type { NewsEventRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function NewsEventManager({ items }: { items: NewsEventRecord[] }) {
  const [editing, setEditing] = useState<NewsEventRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "news" | "event">("all");
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveNewsEventAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const filtered = activeTab === "all" ? items : items.filter((i) => i.type === activeTab);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const res = await deleteNewsEventAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`"${title}" deleted.`);
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
              {editing ? `Edit: ${editing.title}` : "Create News or Event Announcement"}
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
            {editing?.slug && <input type="hidden" name="slug" value={editing.slug} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700">Headline / Title *</label>
                <input
                  name="title"
                  defaultValue={editing?.title || ""}
                  required
                  placeholder="e.g. National Science Olympiad Winners"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Type</label>
                <select
                  name="type"
                  defaultValue={editing?.type || "news"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="news">News Article</option>
                  <option value="event">Upcoming / Past Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Category Tag</label>
                <input
                  name="category"
                  defaultValue={editing?.category || "Campus"}
                  placeholder="e.g. Cultural, Sports, Academic, Achievement"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Event Date (if event)</label>
                <input
                  name="event_date"
                  type="datetime-local"
                  defaultValue={editing?.event_date ? editing.event_date.slice(0, 16) : ""}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Venue / Location</label>
                <input
                  name="venue"
                  defaultValue={editing?.venue || ""}
                  placeholder="e.g. Central College Auditorium"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <ImageUploadInput
                  name="cover_image_url"
                  label="Cover Photo / Featured Image"
                  defaultValue={editing?.cover_image_url || ""}
                  folder="news-events"
                  helperText="Upload a photo for this news article or event (JPG, PNG, WebP up to 10MB)."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Publication Status</label>
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
              <label className="block text-xs font-semibold text-gray-700">Short Summary</label>
              <textarea
                name="summary"
                rows={2}
                defaultValue={editing?.summary || ""}
                placeholder="One or two sentence summary shown on news cards..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">Full Story / Details *</label>
                <span className="text-[11px] text-gray-400">Press Enter for new paragraphs (no HTML needed)</span>
              </div>
              <textarea
                name="content"
                rows={6}
                defaultValue={editing?.content || ""}
                placeholder="Write the full story details here..."
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
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
              <SubmitButton label={editing ? "Update Story" : "Publish Story"} />
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs & Add button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "news", "event"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                activeTab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t === "all" ? "All Stories" : t === "news" ? "News Articles" : "Events"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 shrink-0"
        >
          + Add News / Event
        </button>
      </div>

      {/* News/Events Cards / Table */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            <div>
              {item.cover_image_url ? (
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.cover_image_url})` }}
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-gray-100 text-gray-400 text-xs">
                  No Cover Image
                </div>
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      item.type === "event" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[11px] text-gray-400">{item.category}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{item.title}</h3>
                {item.summary && (
                  <p className="text-xs text-gray-500 line-clamp-2">{item.summary}</p>
                )}
                {item.event_date && (
                  <div className="text-[11px] text-gray-500 font-medium">
                    📅 {new Date(item.event_date).toLocaleDateString()}
                    {item.venue ? ` &bull; 📍 ${item.venue}` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t p-3 bg-gray-50 text-xs">
              <span className="text-gray-400 capitalize">{item.status}</span>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(item);
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="font-semibold text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
