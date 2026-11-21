"use client";

import { useActionState } from "react";
import { updateFeaturesAction } from "@/features/website/actions";
import type { FeatureSettings, ActionFeedback } from "@/features/website/types";
import { SubmitButton, FeedbackAlert } from "./FormControls";

export default function FeaturesForm({ initialData }: { initialData: FeatureSettings }) {
  const [state, formAction] = useActionState<ActionFeedback, FormData>(updateFeaturesAction, {});

  const featureList = [
    {
      name: "onlineAdmission",
      emoji: "📝",
      label: "Online Student Admission",
      desc: "Allows new prospective students to submit admission applications directly through the website.",
      warning: null,
      defaultChecked: initialData.onlineAdmission,
    },
    {
      name: "resultPublishing",
      emoji: "🏆",
      label: "Exam Results & Marksheets",
      desc: "Allows publishing and public/portal lookup of semester, terminal, and annual examination results.",
      warning: null,
      defaultChecked: initialData.resultPublishing,
    },
    {
      name: "studentPortal",
      emoji: "🎒",
      label: "Student Portal Access",
      desc: "Enables the student login area where students can view their class routine, results, and digital ID card.",
      warning: null,
      defaultChecked: initialData.studentPortal,
    },
    {
      name: "teacherPortal",
      emoji: "👩‍🏫",
      label: "Teacher / Faculty Portal",
      desc: "Enables the teacher login area for attendance entry, mark submission, and student academic monitoring.",
      warning: null,
      defaultChecked: initialData.teacherPortal,
    },
    {
      name: "noticeBoard",
      emoji: "📌",
      label: "Public Notice Board & Circulars",
      desc: "Displays the public notice board with PDF downloads for urgent circulars and holiday announcements.",
      warning: null,
      defaultChecked: initialData.noticeBoard,
    },
    {
      name: "gallery",
      emoji: "🖼️",
      label: "Campus Photo & Media Gallery",
      desc: "Displays photo and video albums of campus celebrations, laboratory work, sports day, and cultural programs.",
      warning: null,
      defaultChecked: initialData.gallery,
    },
    {
      name: "careerPortal",
      emoji: "💼",
      label: "Job Vacancies & Career Portal",
      desc: "Allows publishing teacher/staff recruitment notices with online job applications.",
      warning: "💡 Note: Keep turned OFF if you do not actively hire staff through the public website.",
      defaultChecked: initialData.careerPortal,
    },
    {
      name: "onlinePayment",
      emoji: "💳",
      label: "Online Tuition & Fee Payment Gateway",
      desc: "Enables online fee collection using mobile banking and cards (bKash, Nagad, Rocket, Visa/Mastercard).",
      warning: "⚠️ Attention: Only enable this after your payment gateway merchant account (e.g. bKash/SSLCommerz) is officially connected.",
      defaultChecked: initialData.onlinePayment,
    },
  ];

  return (
    <form action={formAction} className="max-w-3xl space-y-5 rounded-lg border bg-white p-6 shadow-sm">
      <FeedbackAlert state={state} />

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-900">⚙️ Website Features & Modules</p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          Enable or disable entire functional sections of your college website with one click.
          If an option is turned OFF, its links and public pages will be disabled for regular visitors.
        </p>
      </div>

      <div className="space-y-3">
        {featureList.map((f) => (
          <div
            key={f.name}
            className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
          >
            <div className="space-y-1 pr-4">
              <label htmlFor={f.name} className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
                <span>{f.emoji}</span>
                <span>{f.label}</span>
              </label>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              {f.warning && (
                <p className="text-[11px] font-medium text-amber-800 bg-amber-50 rounded px-2 py-1 mt-1 border border-amber-200 inline-block">
                  {f.warning}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 flex items-center pt-1">
              <input
                type="checkbox"
                id={f.name}
                name={f.name}
                defaultChecked={f.defaultChecked}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-3 border-t">
        <SubmitButton label="💾 Save Feature Settings" />
      </div>
    </form>
  );
}
