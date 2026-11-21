"use client";

import { useActionState, useState } from "react";
import { updateAppearanceAction } from "@/features/website/actions";
import type { AppearanceSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function AppearanceForm({ initialData }: { initialData: AppearanceSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateAppearanceAction, {});
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form action={formAction} className="max-w-3xl space-y-5 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* Warning notice */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm font-bold text-orange-800">⚠️ For the Design Team Only</p>
        <p className="text-xs text-orange-700 mt-1 leading-relaxed">
          These settings control the <strong>look and feel</strong> of the entire website — colors, fonts, and layout.
          Changing them incorrectly can affect how the website looks for all visitors.
          <strong> Only change these if you know what you are doing.</strong>
        </p>
      </div>

      {/* Basic layout toggle — this one is safe enough */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-900">📌 Navigation</h3>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
          <div>
            <label htmlFor="headerSticky" className="text-sm font-semibold text-gray-800 cursor-pointer">
              Sticky Header (Stays at top while scrolling)
            </label>
            <p className="text-xs text-gray-500 mt-0.5">When ON, the top menu stays visible as visitors scroll down the page.</p>
          </div>
          <input
            type="checkbox"
            name="headerSticky"
            id="headerSticky"
            defaultChecked={initialData.headerSticky}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ml-4 flex-shrink-0"
          />
        </div>
      </div>

      {/* Advanced settings — hidden by default */}
      <div className="rounded-lg border border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-bold text-gray-700">
            🎨 Advanced Design Settings (Colors, Fonts, Layout)
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {showAdvanced ? "▲ Hide" : "▼ Show (Design team only)"}
          </span>
        </button>

        <div className={showAdvanced ? "border-t p-4 space-y-5" : "hidden"}>
          {/* Colors */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Website Colors</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Primary Color</label>
                <p className="text-[10px] text-gray-400 mb-1">Header bar, main buttons, active links</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="primaryColor"
                    defaultValue={initialData.primaryColor || "#1e40af"}
                    className="h-9 w-12 cursor-pointer rounded border p-1"
                  />
                  <span className="text-xs font-mono text-gray-500">{initialData.primaryColor || "#1e40af"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Secondary Color</label>
                <p className="text-[10px] text-gray-400 mb-1">Sub-headings, tags, accents</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="secondaryColor"
                    defaultValue={initialData.secondaryColor || "#0f766e"}
                    className="h-9 w-12 cursor-pointer rounded border p-1"
                  />
                  <span className="text-xs font-mono text-gray-500">{initialData.secondaryColor || "#0f766e"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Accent Color</label>
                <p className="text-[10px] text-gray-400 mb-1">Notice badges, highlights, alerts</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="accentColor"
                    defaultValue={initialData.accentColor || "#f59e0b"}
                    className="h-9 w-12 cursor-pointer rounded border p-1"
                  />
                  <span className="text-xs font-mono text-gray-500">{initialData.accentColor || "#f59e0b"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Font & Page Width</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Website Font</label>
                <select
                  name="fontFamily"
                  defaultValue={initialData.fontFamily || "Inter, sans-serif"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="Inter, sans-serif">Inter — Modern & Clean (Recommended)</option>
                  <option value="Roboto, sans-serif">Roboto — Standard Google Font</option>
                  <option value="Merriweather, serif">Merriweather — Traditional Academic</option>
                  <option value="system-ui, sans-serif">System Font — Fastest Loading</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Page Content Width</label>
                <select
                  name="containerWidth"
                  defaultValue={initialData.containerWidth || "max-w-7xl"}
                  className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="max-w-6xl">Compact — Better on small screens (1152px)</option>
                  <option value="max-w-7xl">Standard — Balanced layout (1280px) ✓</option>
                  <option value="max-w-screen-2xl">Wide — Full-width on large monitors (1536px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t">
        <SubmitButton label="💾 Save Appearance Settings" />
      </div>
    </form>
  );
}
