"use client";

import { useActionState, useState } from "react";
import { updateSeoAction } from "@/features/website/actions";
import type { SeoSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function SeoForm({ initialData }: { initialData: SeoSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateSeoAction, {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form action={formAction} className="max-w-3xl space-y-5 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* What is SEO explanation */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-900">🔍 Google & Search Engine Settings</p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          These settings control how your website appears when people search for your college on <strong>Google</strong>.
          Filling these in helps more students and parents find your website.
        </p>
      </div>

      {/* Core SEO fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Title shown in Google search results <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-1">
            This is the blue link title people see in Google. Keep it under 60 characters for best results.
          </p>
          <input
            name="metaTitle"
            defaultValue={initialData.metaTitle}
            required
            placeholder="e.g. Dhaka Model College — Leading HSC College in Dhaka"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Short description shown in Google</label>
          <p className="text-xs text-gray-500 mb-1">
            The small paragraph under the title in search results. Keep it between 140–160 characters.
          </p>
          <textarea
            name="metaDescription"
            rows={3}
            defaultValue={initialData.metaDescription}
            placeholder="e.g. Established in 1985, Dhaka Model College offers HSC programs in Science, Commerce, and Humanities with a 98% pass rate."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Search Keywords</label>
          <p className="text-xs text-gray-500 mb-1">
            Words students might type in Google to find your college. Separate each with a comma.
          </p>
          <input
            name="keywords"
            defaultValue={initialData.keywords}
            placeholder="e.g. HSC college Dhaka, higher secondary admission, Dhaka Model College, science college"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <ImageUploadInput
            name="ogImageUrl"
            label="Image shown when sharing your website link"
            defaultValue={initialData.ogImageUrl || ""}
            folder="seo"
            helperText="Upload a preview image (1200×630px recommended). This is shown when someone shares your link on Facebook, WhatsApp, or Messenger. (JPG, PNG, WebP up to 10MB)"
          />
        </div>
      </div>

      {/* Advanced: Google Analytics — collapsed */}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-bold text-gray-700">📈 Google Analytics (Advanced)</span>
          <span className="text-xs text-gray-400 font-medium">
            {showAdvanced ? "▲ Hide" : "▼ Show"}
          </span>
        </button>

        {showAdvanced && (
          <div className="border-t p-4 space-y-3">
            <div className="rounded bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800 font-medium">
                ℹ️ Google Analytics lets you see how many people visit your website and which pages they open.
                You need a Google Analytics account to get this ID. Leave blank if you are not using it.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Google Analytics Tracking ID</label>
              <input
                name="googleAnalyticsId"
                defaultValue={initialData.googleAnalyticsId}
                placeholder="e.g. G-ABC1234567"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">Starts with G- for Google Analytics 4</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t">
        <SubmitButton label="💾 Save Google & SEO Settings" />
      </div>
    </form>
  );
}
