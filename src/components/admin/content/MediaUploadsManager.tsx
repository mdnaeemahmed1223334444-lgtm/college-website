"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  addGalleryPhotosBatchAction,
  deleteGalleryPhotoAction,
  updateGalleryPhotoTitleAction,
} from "@/features/content/actions";
import { type GalleryItemRecord, type GalleryAlbumRecord, isMeaningfulTitle } from "@/features/content/types";

export default function MediaUploadsManager({
  initialPhotos,
  albums,
}: {
  initialPhotos: GalleryItemRecord[];
  albums: GalleryAlbumRecord[];
}) {
  const [photos, setPhotos] = useState<GalleryItemRecord[]>(initialPhotos);
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [commonTitle, setCommonTitle] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit photo title modal
  const [editingPhoto, setEditingPhoto] = useState<{ id: string; title: string } | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState<boolean>(false);

  const albumMap = new Map<string, string>();
  albums.forEach((a) => albumMap.set(a.id, a.title));

  function copyToClipboard(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this photo from the website, database, and storage?")) return;
    const res = await deleteGalleryPhotoAction(id);
    if (res.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: "Photo permanently deleted from website, database, and storage." });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleSavePhotoTitle() {
    if (!editingPhoto) return;
    setUpdatingTitle(true);
    const res = await updateGalleryPhotoTitleAction(editingPhoto.id, editingPhoto.title);
    setUpdatingTitle(false);
    if (res.error) {
      setFeedback({ type: "error", message: res.error });
    } else {
      setFeedback({ type: "success", message: "Photo title updated successfully." });
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id ? { ...p, title: editingPhoto.title.trim() || null } : p
        )
      );
      setEditingPhoto(null);
    }
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFeedback(null);
    const uploadedList: { media_url: string; title: string }[] = [];
    const total = files.length;

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        setUploadProgress(`Uploading ${i + 1} of ${total}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "gallery");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          // Do NOT default to file names like "IMG 8101.JPG"!
          const title = commonTitle.trim();
          uploadedList.push({ media_url: data.url, title });
        }
      }

      if (uploadedList.length > 0) {
        setUploadProgress("Saving to database...");
        const res = await addGalleryPhotosBatchAction(uploadedList, selectedAlbum || undefined);
        if (res.error) {
          setFeedback({ type: "error", message: res.error });
        } else {
          setFeedback({
            type: "success",
            message: `Successfully uploaded ${uploadedList.length} photos! They are now saved in the database and visible on the website.`,
          });
          // Optimistically update list
          const newRecords: GalleryItemRecord[] = uploadedList.map((item, idx) => ({
            id: `temp-${Date.now()}-${idx}`,
            album_id: selectedAlbum || null,
            media_url: item.media_url,
            thumbnail_url: item.media_url,
            title: item.title || null,
            media_type: "photo",
            position: idx,
            created_at: new Date().toISOString(),
          }));
          setPhotos((prev) => [...newRecords, ...prev]);
          setCommonTitle("");
        }
      } else {
        setFeedback({ type: "error", message: "No valid image files were processed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">
          Content Management
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Media Upload Center</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Media &amp; File Upload Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple photos at once to your Cloudflare R2 storage and database. Copy public URLs for pages or organize into albums.
          </p>
        </div>

        <Link
          href="/admin/content/gallery"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs"
        >
          <span>📁</span>
          <span>Open Gallery &amp; Albums Manager &rarr;</span>
        </Link>
      </div>

      {feedback && (
        <div
          className={`rounded-lg p-4 text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Multi-Photo Upload Dropzone */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-blue-500 transition shadow-2xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-3xl">
          ☁️
        </div>

        <h3 className="mt-3 text-base font-bold text-gray-900">
          Upload Photos to Database &amp; Cloud Storage
        </h3>
        <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
          Select one or <strong>multiple photos at once</strong> (JPG, PNG, WebP up to 10 MB each). They will be automatically hosted and available across the website.
        </p>

        {/* Optional Album Assignment & Title Input */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700">Album:</label>
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 shadow-2xs focus:border-blue-500 focus:outline-none"
            >
              <option value="">General Campus Photos (No Album)</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700">Caption (Optional):</label>
            <input
              type="text"
              value={commonTitle}
              onChange={(e) => setCommonTitle(e.target.value)}
              placeholder="Leave empty for no caption"
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 shadow-2xs focus:border-blue-500 focus:outline-none w-56"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition">
            <span>📷</span>
            <span>Select Multiple Photos from Computer</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </label>

          {isUploading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 animate-pulse mt-2">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>{uploadProgress || "Uploading files..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* Real Media Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-bold text-gray-900">
            Uploaded Media Assets ({photos.length})
          </h2>
          <span className="text-xs text-gray-500">Live storage &amp; database assets</span>
        </div>

        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center bg-white space-y-2">
            <span className="text-4xl block">🖼️</span>
            <h4 className="text-sm font-bold text-gray-800">No photos uploaded yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Use the upload box above to select and upload your college campus, laboratory, or event photos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((item) => {
              const albumTitle = item.album_id ? albumMap.get(item.album_id) : "General Media";
              const hasMeaningful = isMeaningfulTitle(item.title);

              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="h-40 w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.media_url})` }}
                    />
                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase truncate">
                          {albumTitle}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs truncate" title={item.title || ""}>
                        {hasMeaningful ? (
                          item.title
                        ) : (
                          <span className="text-gray-400 italic font-normal">No Title (Clean)</span>
                        )}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400 truncate">
                        {item.media_url}
                      </p>
                    </div>
                  </div>

                  <div className="border-t p-2.5 bg-gray-50/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.media_url, item.id)}
                      className="rounded border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
                    >
                      {copiedId === item.id ? "✓ Copied!" : "📋 Copy"}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPhoto({
                            id: item.id,
                            title: hasMeaningful ? (item.title as string) : "",
                          })
                        }
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        ✏️ Title
                      </button>
                      <a
                        href={item.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        Preview ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Photo Title Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-gray-900">Edit Photo Title / Caption</h3>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Give this photo a custom title, or leave it empty so the photo appears cleanly without any caption or file name on the website.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Photo Title</label>
              <input
                type="text"
                value={editingPhoto.title}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                placeholder="Leave blank for no caption"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                disabled={updatingTitle}
                onClick={() => setEditingPhoto(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingTitle}
                onClick={handleSavePhotoTitle}
                className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {updatingTitle ? "Saving..." : "Save Title"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
