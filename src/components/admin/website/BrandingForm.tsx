"use client";

import { useActionState, useState } from "react";
import { updateBrandingAction } from "@/features/website/actions";
import type { BrandingSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";
import ImageUploadInput from "@/components/shared/ImageUploadInput";

export default function BrandingForm({ initialData }: { initialData: BrandingSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateBrandingAction, {});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [name, setName] = useState(initialData.collegeName);
  const [shortName, setShortName] = useState(initialData.shortName);
  const [motto, setMotto] = useState(initialData.motto);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Friendly Guide Banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-xs text-blue-900 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <span className="font-bold">One-Time Setup:</span> This is your official college identity.
          You rarely need to change this once set. Changes here update your website header, footer, and official documents.
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Preview of Header Identity
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white shadow-xs">
            {shortName || "COL"}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{name || "College Full Name"}</div>
            <div className="text-xs text-gray-500">{motto || "Excellence in Education and Character"}</div>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <FeedbackAlert state={state} />

        {/* Section 1: Everyday Names */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            1. College Name & Motto
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              Official College Name <span className="text-red-500">*</span>
            </label>
            <p className="text-[11px] text-gray-500 mb-1">
              The full official name of your college (appears in the header, footer, and titles).
            </p>
            <input
              name="collegeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Dhaka Model College"
              className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-800">
                Short Name / Acronym
              </label>
              <p className="text-[11px] text-gray-500 mb-1">
                Used in badges, mobile headers, and small buttons.
              </p>
              <input
                name="shortName"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. DMC"
                className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800">
                Established Year
              </label>
              <p className="text-[11px] text-gray-500 mb-1">
                The founding year of the institution.
              </p>
              <input
                name="establishedYear"
                defaultValue={initialData.establishedYear}
                placeholder="e.g. 1998"
                className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800">
              College Slogan / Motto
            </label>
            <p className="text-[11px] text-gray-500 mb-1">
              A brief inspiring phrase displayed under your college name.
            </p>
            <input
              name="motto"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="e.g. Excellence in Education, Character, and Innovation"
              className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Logo */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2">
            2. College Logo Image
          </h3>

          <div>
            <ImageUploadInput
              name="logoUrl"
              label="College Logo Image"
              defaultValue={initialData.logoUrl || ""}
              folder="branding"
              helperText="Upload your college logo directly from your computer. Leave blank to use the short name badge instead. (PNG with transparent background recommended, up to 10MB)"
            />
          </div>
        </div>

        {/* Section 3: Official Board Codes (Cleanly Collapsible) */}
        <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-800">3. Government & Board Codes</span>
              <p className="text-[11px] text-gray-500">Official EIIN, Board code, and favicon icon.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="rounded bg-white border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              {showAdvanced ? "▲ Hide Details" : "▼ Show Details"}
            </button>
          </div>

          <div className={showAdvanced ? "grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t" : "hidden"}>
            <div>
              <label className="block text-xs font-bold text-gray-800">EIIN Number</label>
              <input
                name="eiin"
                defaultValue={initialData.eiin}
                placeholder="e.g. 134250"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800">College Board Code</label>
              <input
                name="collegeCode"
                defaultValue={initialData.collegeCode}
                placeholder="e.g. 1082"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 shadow-xs focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadInput
                name="faviconUrl"
                label="Browser Favicon / Tab Icon"
                defaultValue={initialData.faviconUrl || ""}
                folder="branding"
                helperText="Upload your favicon (ICO, PNG or SVG, ideally 32×32px). This appears in the browser tab."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t">
          <SubmitButton label="Save College Information" />
        </div>
      </form>
    </div>
  );
}
