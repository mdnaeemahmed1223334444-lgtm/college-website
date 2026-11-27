import Link from "next/link";
import { getEmailSettingsAction } from "@/features/communication/email-actions";

export const metadata = {
  title: "Communication Management | Admin Portal",
  description: "Campus broadcast system, automated notice mailers, student & teacher announcements",
};

export default async function CommunicationOverviewPage() {
  const emailSettings = await getEmailSettingsAction();

  const channels = [
    {
      title: "Brevo Email & Broadcasts",
      href: "/admin/communication/email",
      desc: `Send rich emails with formatting, links, attachments, and exclusions. Connected to Brevo API (${emailSettings.enabled ? "Active" : "Paused"}).`,
      icon: "📧",
      badge: emailSettings.enabled ? "Online" : "Paused",
      badgeColor: emailSettings.enabled ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
      featured: true,
    },
    {
      title: "Notice Board Mailer",
      href: "/admin/content/notices",
      desc: "Publish campus notices and automatically broadcast them to students and teachers.",
      icon: "📢",
    },
    {
      title: "Student Announcements",
      href: "/admin/communication/student-announcements",
      desc: "Targeted portal updates and announcements for active and alumni student batches.",
      icon: "🎓",
    },
    {
      title: "Teacher Announcements",
      href: "/admin/communication/teacher-announcements",
      desc: "Faculty circulars, meeting notices, and department updates for teaching staff.",
      icon: "👨‍🏫",
    },
    {
      title: "SMS Integration",
      href: "/admin/communication/sms",
      desc: "Automated SMS alerts for attendance, emergencies, and guardian notifications.",
      icon: "📱",
    },
    {
      title: "Contact Messages",
      href: "/admin/communication/contact-messages",
      desc: "Public inquiries and feedback submitted through the college website contact form.",
      icon: "📬",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Communication Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage campus broadcasts, multi-channel announcements, and automated email dispatches powered by Brevo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((ch) => (
          <Link
            key={ch.href}
            href={ch.href}
            className={`group rounded-xl border p-5 transition shadow-xs hover:shadow-md ${
              ch.featured
                ? "border-purple-300 bg-gradient-to-br from-purple-50/80 to-white hover:border-purple-500"
                : "border-gray-200 bg-white hover:border-blue-400"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{ch.icon}</span>
              {ch.badge && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ch.badgeColor}`}>
                  {ch.badge}
                </span>
              )}
            </div>
            <h2 className="mt-3 text-base font-bold text-gray-900 group-hover:text-purple-600 transition">
              {ch.title}
            </h2>
            <p className="mt-1 text-xs text-gray-600 line-clamp-3 leading-relaxed">
              {ch.desc}
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-700">
              Open Channel &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
