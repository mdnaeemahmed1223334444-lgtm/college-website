"use client";

import { useActionState, useState } from "react";
import { saveGalleryAlbumAction, deleteGalleryAlbumAction } from "@/features/content/actions";
import type { GalleryAlbumRecord, ContentFeedback } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function GalleryManager({ albums }: { albums: GalleryAlbumRecord[] }) {
  const [editing, setEditing] = useState<GalleryAlbumRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction] = useActionState<ContentFeedback, FormData>(saveGalleryAlbumAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete album "${title}"?`)) return;
    const res = await deleteGalleryAlbumAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Album "${title}" deleted.`);
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
              {editing ? `Edit Album: ${editing.title}` : "Create New Gallery Album"}
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
              <div>
                <label className="block text-xs font-semibold text-gray-700">Album Title *</label>
                <input
                  name="title"
                  defaultValue={editing?.title || ""}
                  required
                  placeholder="e.g. Annual Sports & Athletics 2026"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Category</label>
                <input
                  name="category"
                  defaultValue={editing?.category || "Campus Life"}
                  placeholder="Campus Life, Sports, Cultural, Facilities"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadInput
                  name="cover_image_url"
                  label="Album Cover Photo *"
                  defaultValue={editing?.cover_image_url || ""}
                  folder="gallery"
                  helperText="Upload the main cover photo for this album (JPG, PNG, WebP up to 10MB)."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Media Type</label>
                <select
                  name="media_type"
                  defaultValue={editing?.media_type || "photo"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="photo">Photo Album</option>
                  <option value="video">Video Showcase</option>
                </select>
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
              <label className="block text-xs font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={editing?.description || ""}
                placeholder="Brief summary of this album's events and photos..."
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
              <SubmitButton label={editing ? "Update Album" : "Create Album"} />
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">All Albums ({albums.length})</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Create Album
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <div
            key={album.id}
            className="group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
          >
            <div
              className="h-44 w-full bg-cover bg-center transition group-hover:scale-105"
              style={{ backgroundImage: `url(${album.cover_image_url})` }}
            />
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                  {album.category}
                </span>
                <span className="text-[11px] text-gray-400 capitalize">{album.media_type}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{album.title}</h4>
              {album.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{album.description}</p>
              )}
            </div>
            <div className="flex items-center justify-between border-t p-3 bg-gray-50 text-xs">
              <span className="text-gray-400 capitalize">{album.status}</span>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(album);
                  }}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(album.id, album.title)}
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
