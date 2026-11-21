import Link from "next/link";
import { getNotices, getNewsEvents } from "@/features/content/queries";
import { getAllPages } from "@/features/website/queries";

export default async function DraftsPage() {
  const [notices, news, pages] = await Promise.all([
    getNotices({ status: "draft" }),
    getNewsEvents({ status: "draft" }),
    getAllPages(),
  ]);

  const draftPages = pages.filter((p) => p.status === "draft");
  const totalDrafts = notices.length + news.length + draftPages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Draft & Publish</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Drafts Pending Publication</h1>
          <p className="text-sm text-gray-500">
            Review and approve all unpublished articles, notices, and dynamic pages before going live.
          </p>
        </div>
        <div className="rounded bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800">
          {totalDrafts} Drafts Pending Review
        </div>
      </div>

      {totalDrafts === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-semibold text-gray-800">No Drafts Pending</div>
          <p className="text-xs text-gray-500 mt-1">All content is currently published or archived.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Draft Notices */}
          {notices.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Draft Notices ({notices.length})</h3>
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <tbody className="divide-y divide-gray-100">
                    {notices.map((n) => (
                      <tr key={n.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{n.title}</td>
                        <td className="px-4 py-3 text-gray-400">{n.category}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/admin/content/notices" className="text-blue-600 hover:underline">
                            Open in Notices &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Draft News */}
          {news.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Draft News & Events ({news.length})</h3>
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <tbody className="divide-y divide-gray-100">
                    {news.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                        <td className="px-4 py-3 text-gray-400 capitalize">{item.type}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/admin/content/news-events" className="text-blue-600 hover:underline">
                            Open in News &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Draft Pages */}
          {draftPages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Draft Dynamic Pages ({draftPages.length})</h3>
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <table className="w-full text-left text-xs text-gray-600">
                  <tbody className="divide-y divide-gray-100">
                    {draftPages.map((p) => (
                      <tr key={p.id || p.slug} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                        <td className="px-4 py-3 font-mono text-gray-400">/{p.slug}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/admin/website/pages" className="text-blue-600 hover:underline">
                            Edit Page &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
