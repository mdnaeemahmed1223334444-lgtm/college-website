"use client";

import { useState } from "react";
import Link from "next/link";

export default function MediaUploadsPage() {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleLibrary = [
    {
      name: "Campus Academic Building (Main Façade)",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/campus",
      size: "1.4 MB",
      type: "image/jpeg",
    },
    {
      name: "Physics & Chemistry Advanced Laboratory",
      url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/labs",
      size: "980 KB",
      type: "image/jpeg",
    },
    {
      name: "College Central Digital Library & Reading Room",
      url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/library",
      size: "1.1 MB",
      type: "image/jpeg",
    },
    {
      name: "Computer Science & Artificial Intelligence Lab",
      url: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/ict",
      size: "850 KB",
      type: "image/jpeg",
    },
    {
      name: "Annual Athletics & Sports Playground",
      url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/sports",
      size: "1.6 MB",
      type: "image/jpeg",
    },
    {
      name: "Students Robotics & Innovation Exhibition",
      url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80",
      folder: "public/gallery/science-fair",
      size: "1.2 MB",
      type: "image/jpeg",
    },
  ];

  function copyToClipboard(url: string, index: number) {
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Photo & Video Uploads</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Media & File Upload Center</h1>
        <p className="text-sm text-gray-500">
          Upload media assets to Cloudflare R2 storage and copy public URLs to use in articles, albums, and pages.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-blue-500 transition">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-2xl">
          ☁️
        </div>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">Upload media to Cloudflare R2</h3>
        <p className="mt-1 text-xs text-gray-500">
          Supports PNG, JPG, WebP, PDF up to 5 MB per file.
        </p>
        <div className="mt-4 flex justify-center">
          <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700">
            Browse Local File
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0].name);
                }
              }}
            />
          </label>
        </div>
        {selectedFile && (
          <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-700">
            Selected: <strong>{selectedFile}</strong> (Ready to upload to R2 bucket)
          </div>
        )}
      </div>

      {/* R2 Key Conventions Note */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4 text-xs text-purple-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <span>ℹ️</span> Cloudflare R2 Folder Conventions:
        </div>
        <ul className="list-disc pl-5 space-y-1 text-purple-800">
          <li><code>public/gallery/&lt;albumId&gt;/&lt;file&gt;</code> &mdash; Publicly visible album photos.</li>
          <li><code>public/site/&lt;file&gt;</code> &mdash; Public site assets, logos, and banners.</li>
          <li><code>private/students/&lt;studentId&gt;/&lt;file&gt;</code> &mdash; Confidential student identity photos (signed URLs only).</li>
        </ul>
      </div>

      {/* Media Library */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Available Media Assets ({sampleLibrary.length})</h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampleLibrary.map((item, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg border bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div
                  className="h-36 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.url})` }}
                />
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-gray-900 text-xs truncate">{item.name}</h4>
                  <div className="text-[11px] font-mono text-gray-400">{item.folder}</div>
                  <div className="text-[10px] text-gray-500">{item.size} &bull; {item.type}</div>
                </div>
              </div>

              <div className="border-t p-2.5 bg-gray-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url, idx)}
                  className="rounded border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                >
                  {copiedIndex === idx ? "✓ Link Copied!" : "📋 Copy URL"}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Preview ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
