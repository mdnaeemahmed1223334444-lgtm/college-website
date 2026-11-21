"use client";

import { useActionState } from "react";
import { updateHomepageSectionsAction } from "@/features/website/actions";
import type { HomepageSectionsSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function HomepageSectionsForm({ initialData }: { initialData: HomepageSectionsSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateHomepageSectionsAction, {});

  const sections = [
    {
      name: "noticeTicker",
      emoji: "📢",
      label: "Scrolling Announcement Strip",
      desc: "The moving text at the very top of every page — shows urgent notices like exam dates or admission alerts.",
      defaultChecked: initialData.noticeTicker,
    },
    {
      name: "heroSection",
      emoji: "🖼️",
      label: "Main Welcome Banner",
      desc: "The large image/banner area visitors see first — includes the headline, description text, and admission button.",
      defaultChecked: initialData.heroSection,
    },
    {
      name: "quickLinks",
      emoji: "⚡",
      label: "Quick Access Buttons",
      desc: "Shortcut cards on the front page for Routine, Results, Exam Schedule, and Student Portal — popular with students.",
      defaultChecked: initialData.quickLinks,
    },
    {
      name: "principalMessage",
      emoji: "🎓",
      label: "Principal's Welcome Message",
      desc: "Shows a short message and photo from the Principal on the front page. Great for first-time visitors.",
      defaultChecked: initialData.principalMessage,
    },
    {
      name: "statistics",
      emoji: "📊",
      label: "College Numbers & Achievements",
      desc: "Animated counters showing total students, teachers, pass rate, and years since established.",
      defaultChecked: initialData.statistics,
    },
    {
      name: "latestNews",
      emoji: "📰",
      label: "Latest News & Events",
      desc: "Shows the 3 most recent news articles and upcoming events on the front page.",
      defaultChecked: initialData.latestNews,
    },
    {
      name: "galleryPreview",
      emoji: "🖼️",
      label: "Photo Gallery Preview",
      desc: "Shows a few recent photos from the campus gallery — sports day, science fair, celebrations, etc.",
      defaultChecked: initialData.galleryPreview,
    },
  ];

  return (
    <form action={formAction} className="max-w-3xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-2">
        <p className="text-sm text-gray-600">
          Turn each section <strong>ON or OFF</strong> to control what appears on your college front page.
          Changes take effect immediately after saving.
        </p>
      </div>

      <FeedbackAlert state={state} />

      <div className="space-y-3">
        {sections.map((s) => (
          <div
            key={s.name}
            className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
          >
            <div className="space-y-0.5 pr-4">
              <label htmlFor={s.name} className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </label>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
            <div className="flex-shrink-0 flex items-center pt-1">
              <input
                type="checkbox"
                id={s.name}
                name={s.name}
                defaultChecked={s.defaultChecked}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <SubmitButton label="💾 Save Front Page Layout" />
      </div>
    </form>
  );
}
