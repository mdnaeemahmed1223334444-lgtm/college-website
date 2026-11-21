import Link from "next/link";
import { getContentDashboardStats } from "@/features/content/queries";

export default async function ContentManagementOverviewPage() {
  const stats = await getContentDashboardStats();

  const modules = [
    {
      title: "Notice Management",
      href: "/admin/content/notices",
      desc: `Official announcements and circulars (${stats.totalNotices} total, ${stats.urgentNotices} urgent).`,
      icon: "📢",
    },
    {
      title: "News & Events",
      href: "/admin/content/news-events",
      desc: `Campus stories, cultural functions, sports meets (${stats.totalNews} news, ${stats.totalEvents} events).`,
      icon: "📰",
    },
    {
      title: "Gallery Management",
      href: "/admin/content/gallery",
      desc: `Photo and video albums showcasing campus life (${stats.totalAlbums} active albums).`,
      icon: "🖼️",
    },
    {
      title: "Photo & Video Uploads",
      href: "/admin/content/uploads",
      desc: "Upload media to Cloudflare R2 and copy public image URLs.",
      icon: "☁️",
    },
    {
      title: "Page Content Editor",
      href: "/admin/content/page-editor",
      desc: "Dedicated WYSIWYG/HTML content composer for website articles and documents.",
      icon: "✏️",
    },
    {
      title: "Document Management",
      href: "/admin/content/documents",
      desc: `Public downloadable forms, syllabi, handbooks (${stats.totalDocuments} files active).`,
      icon: "📁",
    },
    {
      title: "Career Circulars",
      href: "/admin/content/career-circulars",
      desc: `Faculty and staff job circulars (${stats.totalCareers} open vacancies).`,
      icon: "💼",
    },
    {
      title: "Holiday Management",
      href: "/admin/content/holidays",
      desc: `Academic calendar closures and national holidays (${stats.totalHolidays} scheduled in 2026).`,
      icon: "🏖️",
    },
    {
      title: "Draft & Publish",
      href: "/admin/content/drafts",
      desc: "Review unpublished draft content before public release.",
      icon: "📝",
    },
    {
      title: "Scheduled Publishing",
      href: "/admin/content/scheduled",
      desc: "Manage timed content scheduled to publish at a future date.",
      icon: "⏱️",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500">
            Publish official notices, campus news, photo galleries, academic documents, and holiday schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/notices"
            target="_blank"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Notices ↗
          </Link>
          <Link
            href="/gallery"
            target="_blank"
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Gallery ↗
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Official Notices</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.totalNotices}</div>
          <div className="text-xs text-gray-400">{stats.urgentNotices} marked urgent</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">News & Events</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.totalNews + stats.totalEvents}</div>
          <div className="text-xs text-gray-400">{stats.totalEvents} upcoming events</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Gallery Albums</div>
          <div className="mt-1 text-2xl font-bold text-purple-600">{stats.totalAlbums}</div>
          <div className="text-xs text-gray-400">Media collections</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Documents & Downloads</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">{stats.totalDocuments}</div>
          <div className="text-xs text-gray-400">Forms & syllabi</div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">{m.title}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{m.desc}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-600 group-hover:underline">
              Open module &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
