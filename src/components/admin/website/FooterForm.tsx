"use client";

import { useActionState } from "react";
import { updateFooterAction } from "@/features/website/actions";
import type { FooterSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function FooterForm({ initialData }: { initialData: FooterSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateFooterAction, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-6 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* What is the footer */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-bold text-gray-700">📋 What is the Footer?</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          The footer is the section at the <strong>very bottom</strong> of every page of your website.
          It typically shows contact information, a short description of the college, and copyright text.
        </p>
      </div>

      {/* College description */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">Short College Description</label>
        <p className="text-xs text-gray-500 mb-1">
          A 1–2 sentence description shown at the bottom of the website. Keep it brief and professional.
        </p>
        <textarea
          name="aboutText"
          rows={3}
          defaultValue={initialData.aboutText}
          placeholder="e.g. Dhaka Model College, established in 1985, is a leading higher secondary institution committed to academic excellence and character development."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Contact information */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-900">📞 Contact Information</h3>
        <p className="text-xs text-gray-500 -mt-2">
          This contact info is shown in the footer and on the Contact Us page.
        </p>

        <div>
          <label className="block text-sm font-semibold text-gray-800">College Address</label>
          <input
            name="address"
            defaultValue={initialData.address}
            placeholder="e.g. Mirpur-12, Dhaka-1216, Bangladesh"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800">Phone Number(s)</label>
            <p className="text-xs text-gray-500 mb-1">Main office phone or mobile number</p>
            <input
              name="phone"
              defaultValue={initialData.phone}
              placeholder="+880 2-9012345"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800">Email Address</label>
            <p className="text-xs text-gray-500 mb-1">Official contact email</p>
            <input
              name="email"
              type="email"
              defaultValue={initialData.email}
              placeholder="info@college.edu.bd"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Emergency / Helpline Number (optional)</label>
          <p className="text-xs text-gray-500 mb-1">A 24/7 emergency contact number, if any</p>
          <input
            name="emergencyHelpline"
            defaultValue={initialData.emergencyHelpline}
            placeholder="+880 1700-000000 (leave blank if not applicable)"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Copyright */}
      <div>
        <label className="block text-sm font-semibold text-gray-800">Copyright Text</label>
        <p className="text-xs text-gray-500 mb-1">
          Shown at the very bottom of the website. Usually includes the college name and current year.
        </p>
        <input
          name="copyrightText"
          defaultValue={initialData.copyrightText}
          placeholder="© 2026 Dhaka Model College. All rights reserved."
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end pt-2 border-t">
        <SubmitButton label="💾 Save Footer Information" />
      </div>
    </form>
  );
}
