"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitButton, FeedbackAlert } from "@/components/admin/website/FormControls";
import { savePageAction } from "@/features/website/actions";
import type { ActionFeedback } from "@/features/website/types";
import { useActionState } from "react";

export default function PageContentEditor() {
  const [title, setTitle] = useState("Example College Policy Page");
  const [slug, setSlug] = useState("information/example-policy");
  const [content, setContent] = useState(
    "<h2>1. Purpose & Scope</h2>\n<p>This policy outlines the college standards for academic excellence and campus discipline.</p>\n<h2>2. Guidelines</h2>\n<ul>\n  <li>Students must attend 75% of classes.</li>\n  <li>All library books must be returned before semester end.</li>\n</ul>"
  );
  const [state, formAction] = useActionState<ActionFeedback, FormData>(savePageAction, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Page Content Editor</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Page Content Editor & Live Preview</h1>
          <p className="text-sm text-gray-500">
            Write structured HTML or rich text for website pages with side-by-side live rendering.
          </p>
        </div>
        <Link
          href="/admin/website/pages"
          className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          View All Pages &rarr;
        </Link>
      </div>

      <FeedbackAlert state={state} />

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border bg-white p-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700">Page Title *</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">URL Route Slug *</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Publication Status</label>
            <select
              name="status"
              defaultValue="published"
              className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">SEO Meta Title</label>
            <input
              name="seo_title"
              placeholder="Defaults to Page Title"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Two-column editor & preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Source Code / HTML */}
          <div className="rounded-lg border bg-white shadow-sm flex flex-col">
            <div className="border-b px-4 py-2.5 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Source HTML Editor</span>
              <span className="text-[11px] text-gray-400 font-mono">HTML / Rich Tags</span>
            </div>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full font-mono text-xs p-4 flex-1 focus:outline-none"
              placeholder="Write your HTML here..."
            />
          </div>

          {/* Live Preview Pane */}
          <div className="rounded-lg border bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="border-b px-4 py-2.5 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Live Website Preview</span>
              <span className="rounded bg-green-100 text-green-800 text-[10px] px-2 py-0.5">Live Render</span>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <h1 className="text-2xl font-extrabold text-gray-900 border-b pb-3 mb-4">{title}</h1>
              <div
                className="prose prose-blue max-w-none text-xs text-gray-700 space-y-3 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <SubmitButton label="Save & Publish Page" />
        </div>
      </form>
    </div>
  );
}
