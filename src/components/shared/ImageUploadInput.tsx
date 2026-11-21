"use client";

import { useState, useRef, useId } from "react";

interface ImageUploadInputProps {
  name: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  folder?: string;
  helperText?: string;
  required?: boolean;
  allowManualUrl?: boolean;
  onChange?: (url: string) => void;
}

export default function ImageUploadInput({
  name,
  label = "Upload Photo",
  defaultValue = "",
  value,
  folder = "photos",
  helperText = "Directly upload a photo from your computer or phone (JPG, PNG, WebP up to 10MB).",
  required = false,
  allowManualUrl = true,
  onChange,
}: ImageUploadInputProps) {
  const [internalUrl, setInternalUrl] = useState<string>(value ?? defaultValue);
  const imageUrl = value !== undefined ? value : internalUrl;
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uniqueId = useId();

  function updateUrl(newUrl: string) {
    setInternalUrl(newUrl);
    onChange?.(newUrl);
  }

  async function handleFileSelect(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image file size must be less than 10 MB.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload image");
      }

      // If an existing photo was uploaded during this session, delete it so unused files don't pile up
      if (imageUrl && imageUrl.startsWith("/uploads/") && imageUrl !== defaultValue) {
        fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        }).catch(() => {});
      }

      updateUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  function handleRemove() {
    // If user removes an uploaded picture, delete it from the website storage immediately
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      }).catch(() => {});
    }

    updateUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={uniqueId} className="block text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {allowManualUrl && (
          <button
            type="button"
            onClick={() => setShowManualUrl(!showManualUrl)}
            className="text-[11px] font-medium text-teal-700 hover:text-teal-900"
          >
            {showManualUrl ? "Upload from device" : "Or paste link"}
          </button>
        )}
      </div>

      {/* Hidden input to pass value into Server Actions and standard form submissions */}
      <input
        type="hidden"
        name={name}
        id={uniqueId}
        value={imageUrl}
        required={required}
      />

      {showManualUrl ? (
        <div>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => updateUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg or /uploads/..."
            className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-teal-500 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Paste an image link or switch back to upload directly from your device.
          </p>
        </div>
      ) : (
        <div>
          {/* Preview State */}
          {imageUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-teal-300 bg-white shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Uploaded preview"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-900">
                  <span className="text-green-600">✓</span> Photo Hosted Successfully
                </div>
                <p className="text-[11px] text-teal-700 font-mono truncate mt-0.5 max-w-xs">
                  {imageUrl}
                </p>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded bg-teal-700 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-teal-800 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="rounded border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Drop Area */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                dragOver
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 bg-gray-50/70 hover:border-teal-400 hover:bg-teal-50/30"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center gap-2 py-3 text-xs font-semibold text-teal-800">
                  <svg
                    className="animate-spin h-5 w-5 text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Uploading and hosting photo on website...
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 mb-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs font-semibold text-gray-800">
                    <span className="text-teal-700 hover:underline">Choose a photo</span> or drag and drop here
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    JPG, PNG, WebP or GIF up to 10 MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-600 font-medium">⚠️ {uploadError}</p>
      )}

      {helperText && !imageUrl && !uploadError && (
        <p className="text-[11px] text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
