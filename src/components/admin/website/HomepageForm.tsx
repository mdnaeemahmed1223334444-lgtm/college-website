"use client";

import { useActionState } from "react";
import { updateHomepageAction } from "@/features/website/actions";
import type { HomepageSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function HomepageForm({ initialData }: { initialData: HomepageSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateHomepageAction, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* ── Section 1: Main Banner ── */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-4">
        <div>
          <h3 className="text-base font-bold text-blue-900">🖼️ Main Welcome Banner</h3>
          <p className="text-xs text-blue-700 mt-0.5">
            This is the big section visitors see first when they open your website — the headline, description, and buttons.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Main Headline <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-1">The big bold text at the top of the front page (e.g. "Welcome to XYZ College")</p>
          <input
            name="heroTitle"
            defaultValue={initialData.heroTitle}
            required
            placeholder="e.g. Welcome to Dhaka Model College"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Short Description</label>
          <p className="text-xs text-gray-500 mb-1">1–2 sentences shown below the headline (optional)</p>
          <textarea
            name="heroSubtitle"
            rows={2}
            defaultValue={initialData.heroSubtitle}
            placeholder="e.g. Nurturing bright futures since 1985 — a leading higher secondary college in Dhaka."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Main Button Text</label>
            <p className="text-xs text-gray-500 mb-1">Label on the first (blue) button</p>
            <input
              name="heroCtaText"
              defaultValue={initialData.heroCtaText}
              placeholder="e.g. Apply for Admission"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Main Button Link</label>
            <p className="text-xs text-gray-500 mb-1">Where does clicking it go?</p>
            <input
              name="heroCtaLink"
              defaultValue={initialData.heroCtaLink}
              placeholder="e.g. /admission/apply"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Second Button Text</label>
            <p className="text-xs text-gray-500 mb-1">Label on the second (outline) button</p>
            <input
              name="heroSecondaryText"
              defaultValue={initialData.heroSecondaryText}
              placeholder="e.g. Explore Our Programs"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Second Button Link</label>
            <p className="text-xs text-gray-500 mb-1">Where does clicking it go?</p>
            <input
              name="heroSecondaryLink"
              defaultValue={initialData.heroSecondaryLink}
              placeholder="e.g. /academic/courses"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <ImageUploadInput
            name="bannerImageUrl"
            label="Banner Background Image (optional)"
            defaultValue={initialData.bannerImageUrl || ""}
            folder="homepage"
            helperText="Upload a photo for the main welcome banner background. If left blank, a blue gradient is shown instead. (JPG, PNG, WebP up to 10MB — wide/landscape photos work best)"
          />
        </div>
      </div>

      {/* ── Section 2: Announcement Ticker ── */}
      <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 space-y-4">
        <div>
          <h3 className="text-base font-bold text-amber-900">📢 Scrolling Announcement Strip</h3>
          <p className="text-xs text-amber-700 mt-0.5">
            The red/orange scrolling text at the very top of every page. Use it for urgent notices like exam dates or admission deadlines.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Announcement Messages</label>
          <p className="text-xs text-gray-500 mb-1">
            Type your announcements below. To add multiple, separate each one with a <strong>|</strong> (pipe) character.
          </p>
          <textarea
            name="noticeTickerText"
            rows={3}
            defaultValue={initialData.noticeTickerText}
            placeholder="HSC Admission Form available now! | Final Exam starts 15 December | College closed on 16 December"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-amber-700 font-medium">
            💡 Example: &quot;Admission open | Results on 20 Dec | College holiday on Friday&quot;
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Scrolling Speed</label>
          <p className="text-xs text-gray-500 mb-1">
            How many seconds for one full scroll. Lower = faster. Keep between 15–40 for best readability.
          </p>
          <div className="flex items-center gap-3">
            <input
              name="noticeTickerSpeed"
              type="number"
              min={10}
              max={60}
              defaultValue={initialData.noticeTickerSpeed || 25}
              className="w-24 rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500">seconds</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t">
        <SubmitButton label="💾 Save Front Page Settings" />
      </div>
    </form>
  );
}
