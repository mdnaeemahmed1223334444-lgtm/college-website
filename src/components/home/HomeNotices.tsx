import Link from "next/link";
import { getNotices } from "@/features/content/queries";

export default async function HomeNotices() {
  const notices = await getNotices({ limit: 6 });

  return (
    <section className="space-y-4 animate-fadeInUp delay-200">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-md">
            📢
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
              Notices &amp; Circulars
            </h2>
            <p className="text-xs text-gray-500">
              Official circulars, exam schedules, and academic announcements
            </p>
          </div>
        </div>

        <a
          href="/notices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
        >
          <span>View All Notices</span>
          <span>&rarr;</span>
        </a>
      </div>

      {/* Notice Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {notices.length === 0 ? (
          <div className="col-span-full rounded-xl border bg-white p-8 text-center text-sm text-gray-400">
            No active notices at this time.
          </div>
        ) : (
          notices.map((n, idx) => {
            // Determine format
            const isPdf = n.attachment_type === "pdf" || n.attachment_url?.endsWith(".pdf");
            const isImage =
              n.attachment_type === "image" ||
              Boolean(n.attachment_url?.match(/\.(jpg|jpeg|png|webp)$/i));
            const isWord =
              n.attachment_type === "word" ||
              Boolean(n.attachment_url?.match(/\.(doc|docx)$/i));

            return (
              <div
                key={n.id}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 animate-fadeInUp ${
                  n.is_urgent
                    ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50/40"
                    : n.is_pinned
                    ? "border-purple-200 bg-gradient-to-br from-purple-50/40 to-indigo-50/30"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
                      {n.category}
                    </span>
                    {n.is_pinned && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 font-semibold text-purple-800">
                        📌 Pinned
                      </span>
                    )}
                    {n.is_urgent && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-800 animate-pulse">
                        🚨 Urgent
                      </span>
                    )}
                    <span className="text-gray-400 ml-auto">
                      {n.published_at
                        ? new Date(n.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                    {n.title}
                  </h3>

                  {/* Plain Text Description */}
                  {n.content && (
                    <p className="mt-1.5 text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {n.content.replace(/<[^>]*>/g, "")}
                    </p>
                  )}
                </div>

                {/* Attachment / Action Link */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  {n.attachment_url ? (
                    <a
                      href={n.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-blue-600 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                    >
                      {isPdf && <span>📄 Download PDF</span>}
                      {isImage && <span>🖼️ View Picture</span>}
                      {isWord && <span>📘 Download Word Doc</span>}
                      {!isPdf && !isImage && !isWord && <span>📥 Download File</span>}
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-400">📝 Notice notice only</span>
                  )}

                  <Link
                    href={`/notices?category=${encodeURIComponent(n.category)}`}
                    className="text-xs text-gray-500 hover:text-blue-600 hover:underline font-medium"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
