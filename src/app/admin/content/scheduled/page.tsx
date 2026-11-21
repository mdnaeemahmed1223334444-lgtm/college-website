import Link from "next/link";
import { getNotices, getNewsEvents } from "@/features/content/queries";

export default async function ScheduledPublishingPage() {
  const [notices, news] = await Promise.all([
    getNotices({ status: "scheduled" }),
    getNewsEvents({ status: "scheduled" }),
  ]);

  const totalScheduled = notices.length + news.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Scheduled Publishing</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Scheduled Timed Releases</h1>
          <p className="text-sm text-gray-500">
            Automate publication of time-sensitive notices, exam results, and admissions circulars.
          </p>
        </div>
        <div className="rounded bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800">
          {totalScheduled} Items Queued
        </div>
      </div>

      {totalScheduled === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="font-semibold text-gray-800">No Scheduled Publications</div>
          <p className="text-xs text-gray-500 mt-1">
            When creating notices or news articles, choose &quot;Scheduled&quot; status and set a future publish date.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Item Title</th>
                <th className="px-4 py-3">Content Type</th>
                <th className="px-4 py-3">Scheduled Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{n.title}</td>
                  <td className="px-4 py-3">Notice</td>
                  <td className="px-4 py-3 font-mono text-blue-600">{n.published_at || "Pending"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/admin/content/notices" className="text-blue-600 hover:underline">
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                  <td className="px-4 py-3">News & Events</td>
                  <td className="px-4 py-3 font-mono text-blue-600">{item.published_at || "Pending"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href="/admin/content/news-events" className="text-blue-600 hover:underline">
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
