"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateHomepageAction } from "@/features/website/actions";
import type { HomepageSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function HomepageForm({
  initialData,
  scrollExpandEnabled = true,
}: {
  initialData: HomepageSettings;
  scrollExpandEnabled?: boolean;
}) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateHomepageAction, {});
  const [scrollExpandState, setScrollExpandState] = useState<boolean>(scrollExpandEnabled);

  return (
    <form action={formAction} className="max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* ── ScrollExpand Opening Animation Control ── */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-sm font-bold text-indigo-950">
              ScrollExpand Animation Setting
            </h3>
          </div>
          <Link
            href="/admin/website/scroll-expand-hero"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            Fine-tune animation parameters &rarr;
          </Link>
        </div>
        <p className="text-xs text-indigo-700">
          Control whether the interactive full-screen cinematic scroll-expand animation runs on the homepage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              scrollExpandState
                ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                : "border-gray-200 bg-white/60 hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name="scrollExpandEnabled"
              value="true"
              checked={scrollExpandState}
              onChange={() => setScrollExpandState(true)}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>Enabled</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Displays the smooth scroll-driven expanding photograph animation when the homepage loads.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              !scrollExpandState
                ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                : "border-gray-200 bg-white/60 hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name="scrollExpandEnabled"
              value="false"
              checked={!scrollExpandState}
              onChange={() => setScrollExpandState(false)}
              className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>Disabled</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-700">
                  Standard Hero
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Animation does not initialize or take up scroll space. Direct standard homepage hero is displayed.
              </p>
            </div>
          </label>
        </div>
      </div>

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
            label="Hero Banner Background Photo"
            defaultValue={initialData.bannerImageUrl || ""}
            folder="homepage"
            helperText="The large welcome background photo at the very top of your front page. (Wide landscape photo recommended, up to 10MB)"
          />
        </div>
      </div>

      {/* ── Section 2: About Our Institution Photos ── */}
      <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 space-y-4">
        <div>
          <h3 className="text-base font-bold text-emerald-900">🏛️ About Section Campus Photos</h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            These are the two prominent overlapping photos displayed in the &quot;About Our Institution&quot; section on the front page.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <ImageUploadInput
              name="aboutMainImageUrl"
              label="Main College Campus Photo"
              defaultValue={initialData.aboutMainImageUrl || ""}
              folder="homepage"
              helperText="The primary large photo of your college campus or main academic building (displayed on the left side of the About section)."
            />
          </div>

          <div>
            <ImageUploadInput
              name="aboutSecondaryImageUrl"
              label="Secondary Student / Activity Photo"
              defaultValue={initialData.aboutSecondaryImageUrl || ""}
              folder="homepage"
              helperText="The smaller overlapping photo showing student life, laboratory work, or campus activities."
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Admission Call to Action Photo ── */}
      <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 space-y-4">
        <div>
          <h3 className="text-base font-bold text-indigo-900">🎓 Admission CTA Background Photo</h3>
          <p className="text-xs text-indigo-700 mt-0.5">
            The full-width background photo behind the &quot;Take the First Step Towards Your Future&quot; admission banner near the bottom of the front page.
          </p>
        </div>

        <div>
          <ImageUploadInput
            name="admissionCtaImageUrl"
            label="Admission Banner Background Image"
            defaultValue={initialData.admissionCtaImageUrl || ""}
            folder="homepage"
            helperText="Background photo for the admission invitation banner. (Wide landscape photo, up to 10MB)"
          />
        </div>
      </div>

      {/* ── Section 4: Announcement Ticker ── */}
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
