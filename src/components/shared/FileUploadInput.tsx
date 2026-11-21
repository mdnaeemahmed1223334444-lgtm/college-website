"use client";

import { useState, useRef, useId } from "react";

interface FileUploadInputProps {
  name: string;
  label?: string;
  defaultValue?: string;
  folder?: string;
  accept?: string;
  helperText?: string;
  required?: boolean;
  onUploaded?: (url: string, fileType: "pdf" | "image" | "word") => void;
}

export default function FileUploadInput({
  name,
  label = "Upload File",
  defaultValue = "",
  folder = "documents",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp",
  helperText = "Upload PDF, Word document, or image from your device (up to 10MB).",
  required = false,
  onUploaded,
}: FileUploadInputProps) {
  const [fileUrl, setFileUrl] = useState<string>(defaultValue);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(defaultValue ? defaultValue.split("/").pop() || "" : "");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uniqueId = useId();

  async function handleFileSelect(file: File) {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10 MB.");
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
        throw new Error(data.error || "Failed to upload file");
      }

      if (fileUrl && fileUrl.startsWith("/uploads/") && fileUrl !== defaultValue) {
        fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: fileUrl }),
        }).catch(() => {});
      }

      setFileUrl(data.url);
      setFileName(file.name);

      let ft: "pdf" | "image" | "word" = "pdf";
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "doc" || ext === "docx") ft = "word";
      else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) ft = "image";

      if (onUploaded) {
        onUploaded(data.url, ft);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleRemove() {
    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fileUrl }),
      }).catch(() => {});
    }
    setFileUrl("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={uniqueId} className="block text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <input
        type="hidden"
        name={name}
        id={uniqueId}
        value={fileUrl}
        required={required}
      />

      {fileUrl ? (
        <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/60 p-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold text-sm">
              📄
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-teal-900 truncate">{fileName || fileUrl}</p>
              <p className="text-[11px] text-teal-700 font-mono truncate">{fileUrl}</p>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-800"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 p-4 text-center hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition"
        >
          {isUploading ? (
            <div className="flex items-center gap-2 py-2 text-xs font-semibold text-teal-800">
              <span className="animate-spin text-base">⏳</span> Uploading and hosting file...
            </div>
          ) : (
            <>
              <span className="text-2xl mb-1">📁</span>
              <div className="text-xs font-semibold text-gray-800">
                <span className="text-teal-700 hover:underline">Choose file</span> directly from your device
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{helperText}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {uploadError && <p className="text-xs text-rose-600 font-medium">⚠️ {uploadError}</p>}
    </div>
  );
}
