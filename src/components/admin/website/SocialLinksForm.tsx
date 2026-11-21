"use client";

import { useActionState } from "react";
import { updateSocialLinksAction } from "@/features/website/actions";
import type { SocialLinksSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function SocialLinksForm({ initialData }: { initialData: SocialLinksSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateSocialLinksAction, {});

  return (
    <form action={formAction} className="max-w-3xl space-y-5 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      {/* Helpful introduction */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-900">🌐 Official Social Media & Contact Links</p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          Paste the web links to your college's official social media pages below.
          These will appear as clickable icons in the website header and footer.
          <strong className="block mt-1">💡 Note: If you leave any box blank, that social media icon will automatically be hidden from the website.</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            📘 Facebook Page Link
          </label>
          <p className="text-xs text-gray-500 mb-1">Your official college Facebook page or community page</p>
          <input
            name="facebook"
            defaultValue={initialData.facebook}
            placeholder="https://facebook.com/yourcollegename"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            ▶️ YouTube Channel Link
          </label>
          <p className="text-xs text-gray-500 mb-1">For campus videos, speech recordings, webinars, and cultural programs</p>
          <input
            name="youtube"
            defaultValue={initialData.youtube}
            placeholder="https://youtube.com/@yourcollegechannel"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            💬 WhatsApp Helpline Number or Chat Link
          </label>
          <p className="text-xs text-gray-500 mb-1">
            Students or parents can click this to message your college helpline directly
          </p>
          <input
            name="whatsapp"
            defaultValue={initialData.whatsapp}
            placeholder="+8801700000000 or https://wa.me/8801700000000"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            📷 Instagram Profile Link (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">For campus photography and student life highlights</p>
          <input
            name="instagram"
            defaultValue={initialData.instagram}
            placeholder="https://instagram.com/yourcollege"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            💼 LinkedIn Institutional Page (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">For alumni networking, career connections, and institutional updates</p>
          <input
            name="linkedin"
            defaultValue={initialData.linkedin}
            placeholder="https://linkedin.com/school/yourcollege"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">
            🐦 X / Twitter Profile Link (optional)
          </label>
          <p className="text-xs text-gray-500 mb-1">Official announcements handle</p>
          <input
            name="twitter"
            defaultValue={initialData.twitter}
            placeholder="https://x.com/yourcollege"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t">
        <SubmitButton label="💾 Save Social Media Links" />
      </div>
    </form>
  );
}
