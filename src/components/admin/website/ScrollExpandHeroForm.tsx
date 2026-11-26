"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { updateScrollExpandHeroAction } from "@/features/website/actions";
import type { ScrollExpandHeroSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function ScrollExpandHeroForm({
  initialData,
}: {
  initialData: ScrollExpandHeroSettings;
}) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(
    updateScrollExpandHeroAction,
    {}
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced animation settings state for live slider/number binding
  const [startWidth, setStartWidth] = useState(initialData.startWidth ?? 42);
  const [startHeight, setStartHeight] = useState(initialData.startHeight ?? 58);
  const [startRadius, setStartRadius] = useState(initialData.startRadius ?? 24);
  const [endRadius, setEndRadius] = useState(initialData.endRadius ?? 0);
  const [mediaZoom, setMediaZoom] = useState(initialData.mediaZoom ?? 1.35);
  const [scrollDistance, setScrollDistance] = useState(initialData.scrollDistance ?? 1.2);
  const [holdDistance, setHoldDistance] = useState(initialData.holdDistance ?? 0.35);
  const [smoothing, setSmoothing] = useState(initialData.smoothing ?? 0.1);
  const [overlayScrim, setOverlayScrim] = useState(initialData.overlayScrim ?? 0.45);

  function resetToDefaults() {
    setStartWidth(42);
    setStartHeight(58);
    setStartRadius(24);
    setEndRadius(0);
    setMediaZoom(1.35);
    setScrollDistance(1.2);
    setHoldDistance(0.35);
    setSmoothing(0.1);
    setOverlayScrim(0.45);
  }

  return (
    <form action={formAction} className="max-w-4xl space-y-6 rounded-xl border bg-white p-6 sm:p-8 shadow-sm">
      <FeedbackAlert state={state} />

      {/* Enable / Disable Banner */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/70 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="text-sm font-bold text-blue-950">ScrollExpand Opening Hero Experience</h3>
            <p className="text-xs text-blue-800 mt-1 max-w-xl leading-relaxed">
              When enabled, visitors will be greeted with a cinematic scroll-driven image expansion from a centered frame to full-screen when opening your homepage.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer shrink-0 mt-1">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={initialData.enabled}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">Enable Hero</span>
        </label>
      </div>

      {/* Hero Photograph Upload */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-gray-900">📸 Hero Photograph</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            This is the primary image that expands as visitors scroll. Use a high-quality campus, building, or landmark photo.
          </p>
        </div>

        <ImageUploadInput
          name="heroImage"
          label="Select Hero Image"
          defaultValue={initialData.heroImage || ""}
          folder="homepage"
          helperText="Supported formats: JPG, JPEG, PNG, WebP up to 10 MB. High-resolution landscape or portrait photos are automatically optimized."
          required
        />
      </div>

      {/* Titles & Copywriting */}
      <div className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h4 className="text-sm font-bold text-gray-900">✍️ Hero Text &amp; Call To Action</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800">
              Main Headline Title <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-gray-500 mb-1">
              Displayed in the center of the frame and in the final overlay.
            </p>
            <input
              type="text"
              name="heroTitle"
              defaultValue={initialData.heroTitle || "Where Minds Meet Possibilities"}
              required
              placeholder="e.g. Where Minds Meet Possibilities"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800">Subtitle / Description</label>
            <p className="text-[11px] text-gray-500 mb-1">
              Appears smoothly in the overlay when the expansion is complete.
            </p>
            <textarea
              name="heroSubtitle"
              rows={3}
              defaultValue={
                initialData.heroSubtitle ||
                "Building knowledge, character, and a brighter future through academic excellence and modern innovation."
              }
              placeholder="e.g. Building knowledge, character and a brighter future."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800">Scroll Hint Text</label>
            <p className="text-[11px] text-gray-500 mb-1">
              Subtle text at the bottom prompting visitors to scroll down (e.g. &ldquo;Scroll to explore&rdquo;).
            </p>
            <input
              type="text"
              name="scrollHint"
              defaultValue={initialData.scrollHint || "Scroll to explore"}
              placeholder="Scroll to explore"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-800">Primary Button Label</label>
              <input
                type="text"
                name="ctaText"
                defaultValue={initialData.ctaText || "DISCOVER ADMISSION ↗"}
                placeholder="DISCOVER ADMISSION ↗"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800">Primary Button Link</label>
              <input
                type="text"
                name="ctaLink"
                defaultValue={initialData.ctaLink || "/admission/apply"}
                placeholder="/admission/apply"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800">Secondary Button Label</label>
              <input
                type="text"
                name="secondaryCtaText"
                defaultValue={initialData.secondaryCtaText || "EXPLORE ACADEMICS"}
                placeholder="EXPLORE ACADEMICS"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800">Secondary Button Link</label>
              <input
                type="text"
                name="secondaryCtaLink"
                defaultValue={initialData.secondaryCtaLink || "/academic/courses"}
                placeholder="/academic/courses"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Animation Settings Accordion */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Advanced Animation Settings</h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Fine-tune frame dimensions, zoom scale, scroll distance, and smoothing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition"
            >
              {showAdvanced ? "▲ Hide Controls" : "▼ Show Controls"}
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="pt-4 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {/* Start Width */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Start Width (%)</span>
                <span className="font-mono text-blue-600">{startWidth}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={startWidth}
                onChange={(e) => setStartWidth(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="startWidth" value={startWidth} />
              <p className="text-[10px] text-gray-500">Default: 42% of viewport width</p>
            </div>

            {/* Start Height */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Start Height (%)</span>
                <span className="font-mono text-blue-600">{startHeight}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="1"
                value={startHeight}
                onChange={(e) => setStartHeight(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="startHeight" value={startHeight} />
              <p className="text-[10px] text-gray-500">Default: 58% of viewport height</p>
            </div>

            {/* Start Radius */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Start Corner Radius</span>
                <span className="font-mono text-blue-600">{startRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                step="2"
                value={startRadius}
                onChange={(e) => setStartRadius(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="startRadius" value={startRadius} />
              <p className="text-[10px] text-gray-500">Default: 24px (rounded frame)</p>
            </div>

            {/* End Radius */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>End Corner Radius</span>
                <span className="font-mono text-blue-600">{endRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="2"
                value={endRadius}
                onChange={(e) => setEndRadius(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="endRadius" value={endRadius} />
              <p className="text-[10px] text-gray-500">Default: 0px (full-screen flush)</p>
            </div>

            {/* Media Zoom */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Media Zoom Scale</span>
                <span className="font-mono text-blue-600">{mediaZoom}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={mediaZoom}
                onChange={(e) => setMediaZoom(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="mediaZoom" value={mediaZoom} />
              <p className="text-[10px] text-gray-500">Default: 1.35x initial zoom</p>
            </div>

            {/* Scroll Distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Scroll Distance (vh)</span>
                <span className="font-mono text-blue-600">{scrollDistance}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={scrollDistance}
                onChange={(e) => setScrollDistance(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="scrollDistance" value={scrollDistance} />
              <p className="text-[10px] text-gray-500">Default: 1.2 screen heights</p>
            </div>

            {/* Hold Distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Hold Distance (vh)</span>
                <span className="font-mono text-blue-600">{holdDistance}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={holdDistance}
                onChange={(e) => setHoldDistance(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="holdDistance" value={holdDistance} />
              <p className="text-[10px] text-gray-500">Default: 0.35 hold before scroll</p>
            </div>

            {/* Smoothing */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Smoothing Responsiveness</span>
                <span className="font-mono text-blue-600">{smoothing}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.3"
                step="0.01"
                value={smoothing}
                onChange={(e) => setSmoothing(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="smoothing" value={smoothing} />
              <p className="text-[10px] text-gray-500">Default: 0.1 (smooth easing)</p>
            </div>

            {/* Overlay Scrim */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-800">
                <span>Overlay Scrim Darkness</span>
                <span className="font-mono text-blue-600">{overlayScrim}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={overlayScrim}
                onChange={(e) => setOverlayScrim(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <input type="hidden" name="overlayScrim" value={overlayScrim} />
              <p className="text-[10px] text-gray-500">Default: 0.45 darkness</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
        <Link
          href="/"
          target="_blank"
          className="text-xs font-semibold text-gray-600 hover:text-blue-600 flex items-center gap-1.5"
        >
          <span>👁️ Preview Live Opening on Homepage</span>
          <span>↗</span>
        </Link>

        <SubmitButton label="Save &amp; Publish ScrollExpand Hero" />
      </div>
    </form>
  );
}
