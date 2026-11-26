"use client";

import { useActionState, useState, useRef } from "react";
import {
  saveGalleryAlbumAction,
  deleteGalleryAlbumAction,
  addGalleryPhotoAction,
  addGalleryPhotosBatchAction,
  deleteGalleryPhotoAction,
  updateGalleryPhotoTitleAction,
} from "@/features/content/actions";
import { type GalleryAlbumRecord, type GalleryItemRecord, type ContentFeedback, isMeaningfulTitle } from "@/features/content/types";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function GalleryManager({
  albums,
  initialPhotos = [],
}: {
  albums: GalleryAlbumRecord[];
  initialPhotos?: GalleryItemRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"photos" | "albums">("photos");
  const [photosList, setPhotosList] = useState<GalleryItemRecord[]>(initialPhotos);
  const [uploadMode, setUploadMode] = useState<"batch" | "single">("batch");
  const [editing, setEditing] = useState<GalleryAlbumRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [albumState, albumFormAction] = useActionState<ContentFeedback, FormData>(saveGalleryAlbumAction, {});
  const [photoState, photoFormAction] = useActionState<ContentFeedback, FormData>(addGalleryPhotoAction, {});
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // Batch upload state
  const [batchAlbumId, setBatchAlbumId] = useState<string>("");
  const [batchTitle, setBatchTitle] = useState<string>("");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchUploading, setBatchUploading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<string>("");
  const [batchFeedback, setBatchFeedback] = useState<ContentFeedback | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Edit photo title modal state
  const [editingPhoto, setEditingPhoto] = useState<{ id: string; title: string } | null>(null);
  const [updatingTitle, setUpdatingTitle] = useState<boolean>(false);

  async function handleDeleteAlbum(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete album "${title}"?`)) return;
    const res = await deleteGalleryAlbumAction(id);
    if (res.error) setDeleteMsg(res.error);
    else setDeleteMsg(`Album "${title}" deleted from database.`);
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm("Are you sure you want to permanently remove this photo from the website and database?")) return;
    const res = await deleteGalleryPhotoAction(id);
    if (res.error) setDeleteMsg(res.error);
    else {
      setDeleteMsg("Photo permanently deleted from website and database.");
      setPhotosList((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleSavePhotoTitle() {
    if (!editingPhoto) return;
    setUpdatingTitle(true);
    const res = await updateGalleryPhotoTitleAction(editingPhoto.id, editingPhoto.title);
    setUpdatingTitle(false);
    if (res.error) {
      setDeleteMsg(res.error);
    } else {
      setDeleteMsg("Photo title updated successfully.");
      setPhotosList((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id ? { ...p, title: editingPhoto.title.trim() || null } : p
        )
      );
      setEditingPhoto(null);
    }
  }

  function handleBatchFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setBatchFiles(selected);
      setBatchFeedback(null);
    }
  }

  async function handleBatchUpload() {
    if (batchFiles.length === 0) return;

    setBatchUploading(true);
    setBatchFeedback(null);
    const uploadedResults: { media_url: string; title: string }[] = [];
    const total = batchFiles.length;

    try {
      for (let i = 0; i < total; i++) {
        const file = batchFiles[i];
        setBatchProgress(`Uploading ${i + 1} of ${total}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "gallery");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          // Never default to raw file names like "IMG 8101.JPG"!
          // Only save title if the admin explicitly entered a common title in batchTitle
          const title = batchTitle.trim();
          uploadedResults.push({ media_url: data.url, title });
        }
      }

      if (uploadedResults.length > 0) {
        setBatchProgress("Saving all photos to database...");
        const res = await addGalleryPhotosBatchAction(uploadedResults, batchAlbumId || undefined);

        if (res.error) {
          setBatchFeedback({ success: false, error: res.error });
        } else {
          setBatchFeedback({
            success: true,
            message: `Successfully uploaded and saved ${uploadedResults.length} photos! They are now live on the website.`,
          });
          // Update photo list optimistically
          const newItems: GalleryItemRecord[] = uploadedResults.map((u, idx) => ({
            id: `temp-${Date.now()}-${idx}`,
            album_id: batchAlbumId || null,
            media_url: u.media_url,
            thumbnail_url: u.media_url,
            title: u.title || null,
            media_type: "photo",
            position: idx,
            created_at: new Date().toISOString(),
          }));
          setPhotosList((prev) => [...newItems, ...prev]);
          setBatchFiles([]);
          setBatchTitle("");
          if (multiFileInputRef.current) multiFileInputRef.current.value = "";
        }
      } else {
        setBatchFeedback({ success: false, error: "Failed to upload selected photos." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setBatchFeedback({ success: false, error: msg });
    } finally {
      setBatchUploading(false);
      setBatchProgress("");
    }
  }

  const showAlbumEditor = Boolean(editing || isCreating);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "photos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📷 Upload &amp; Manage Photos ({initialPhotos.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("albums")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "albums"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          📁 Albums &amp; Categories ({albums.length})
        </button>
      </div>

      {deleteMsg && (
        <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          {deleteMsg}
        </div>
      )}

      {/* ────────────────── TAB 1: INDIVIDUAL PHOTOS ────────────────── */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          {/* Quick Photo Upload Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Upload Photos (Displays on Home Page &amp; Gallery)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Photos uploaded here are immediately saved to the database and will be showcased in the Home Page Campus Gallery.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUploadMode("batch")}
                  className={`px-3 py-1 rounded-md transition ${
                    uploadMode === "batch"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  ⚡ Select Multiple Photos
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("single")}
                  className={`px-3 py-1 rounded-md transition ${
                    uploadMode === "single"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Single Photo
                </button>
              </div>
            </div>

            {/* BATCH MULTIPLE PHOTO UPLOADER */}
            {uploadMode === "batch" && (
              <div className="space-y-4">
                {batchFeedback && (
                  <div
                    className={`rounded-lg p-3 text-xs font-medium border ${
                      batchFeedback.success
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}
                  >
                    {batchFeedback.message || batchFeedback.error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Target Album for these Photos</label>
                    <select
                      value={batchAlbumId}
                      onChange={(e) => setBatchAlbumId(e.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">General Campus Gallery (All Albums)</option>
                      {albums.map((alb) => (
                        <option key={alb.id} value={alb.id}>
                          {alb.title} ({alb.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Photo Title / Caption (Optional)</label>
                    <input
                      type="text"
                      value={batchTitle}
                      onChange={(e) => setBatchTitle(e.target.value)}
                      placeholder="e.g. Annual Sports (or leave blank)"
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400">Leave blank for clean photos with no caption.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700">Select Multiple Photos</label>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs">
                        <span>📁 Browse Multiple Files...</span>
                        <input
                          ref={multiFileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={batchUploading}
                          onChange={handleBatchFileSelect}
                        />
                      </label>
                      <span className="text-xs text-gray-500">
                        {batchFiles.length > 0 ? `${batchFiles.length} files selected` : "No files selected yet"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Files Preview Strip */}
                {batchFiles.length > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-900">
                        Ready to upload {batchFiles.length} photos:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBatchFiles([]);
                          if (multiFileInputRef.current) multiFileInputRef.current.value = "";
                        }}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Clear Selection
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {batchFiles.map((file, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-gray-200 text-[11px] text-gray-800 shadow-2xs"
                        >
                          <span>🖼️</span>
                          <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                          <span className="text-gray-400">({(file.size / (1024 * 1024)).toFixed(1)}MB)</span>
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-blue-200">
                      {batchUploading ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 animate-pulse">
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                          <span>{batchProgress}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        disabled={batchUploading}
                        onClick={handleBatchUpload}
                        className="inline-flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        {batchUploading ? "Uploading Batch..." : `Upload All ${batchFiles.length} Photos at Once ↗`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SINGLE PHOTO UPLOADER */}
            {uploadMode === "single" && (
              <div>
                <FeedbackAlert state={photoState} />

                <form action={photoFormAction} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <ImageUploadInput
                        name="media_url"
                        label="Select &amp; Upload Photo *"
                        folder="gallery"
                        helperText="Upload any high-quality campus, event, sports, or academic photo (JPG, PNG, WebP up to 10MB)."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Photo Title / Caption (Optional)</label>
                      <input
                        name="title"
                        placeholder="e.g. Science Laboratory Session (or leave blank)"
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-400">Leave blank for clean photos with no text overlay.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700">Attach to Album (Optional)</label>
                      <select
                        name="album_id"
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">General Campus Photos</option>
                        {albums.map((alb) => (
                          <option key={alb.id} value={alb.id}>
                            {alb.title} ({alb.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t">
                    <SubmitButton label="Save &amp; Show on Website" />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Uploaded Photos Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">
                Uploaded Photos ({photosList.length})
              </h3>
              <span className="text-xs text-gray-500">Live in database &amp; home page</span>
            </div>

            {photosList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-xs text-gray-500 bg-white">
                No individual photos uploaded yet. Select photos above to upload them!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photosList.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-lg border border-gray-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-shadow"
                  >
                    <div
                      className="aspect-square w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${photo.media_url})` }}
                    />
                    <div className="p-2 bg-white space-y-1">
                      <p className="text-[11px] font-medium text-gray-800 truncate" title={photo.title || ""}>
                        {isMeaningfulTitle(photo.title) ? (
                          photo.title
                        ) : (
                          <span className="text-gray-400 italic">No Title (Clean)</span>
                        )}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPhoto({
                              id: photo.id,
                              title: isMeaningfulTitle(photo.title) ? (photo.title as string) : "",
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-red-600 hover:text-red-800 hover:underline"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: ALBUMS ────────────────── */}
      {activeTab === "albums" && (
        <div className="space-y-6">
          {showAlbumEditor && (
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

              <FeedbackAlert state={albumState} />

              <form action={albumFormAction} className="space-y-4">
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
                      onClick={() => handleDeleteAlbum(album.id, album.title)}
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
      )}

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
              Give this photo a custom title (e.g. <span className="font-semibold text-gray-700">Science Exhibition</span>), or leave it empty so the photo appears cleanly without any caption on the website.
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
