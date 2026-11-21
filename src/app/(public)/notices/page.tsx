import Link from "next/link";
import { getNotices } from "@/features/content/queries";

export const metadata = {
  title: "Notices - Dhaka Model College",
  description: "Official notices, circulars, exam schedules, and academic announcements.",
};

export default async function PublicNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const notices = await getNotices({ category: category || "all" });

  const categories = ["all", "Academic", "Admission", "Examination", "General", "Administrative"];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Notices</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            📢 Official Notices
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            All formal notices, circulars, exam schedules, and institutional announcements.
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Showing {notices.length} active {notices.length === 1 ? "notice" : "notices"}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const isActive = (!category && c === "all") || category?.toLowerCase() === c.toLowerCase();
          return (
            <Link
              key={c}
              href={c === "all" ? "/notices" : `/notices?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
            <p className="text-base font-semibold text-gray-600">No notices in this category</p>
            <p className="text-xs text-gray-400 mt-1">Please check back soon or browse all categories.</p>
          </div>
        ) : (
          notices.map((notice) => {
            const isPdf = notice.attachment_type === "pdf" || notice.attachment_url?.endsWith(".pdf");
            const isImage =
              notice.attachment_type === "image" ||
              Boolean(notice.attachment_url?.match(/\.(jpg|jpeg|png|webp)$/i));
            const isWord =
              notice.attachment_type === "word" ||
              Boolean(notice.attachment_url?.match(/\.(doc|docx)$/i));

            return (
              <article
                key={notice.id}
                className={`rounded-xl border p-5 transition shadow-xs hover:shadow-md ${
                  notice.is_urgent
                    ? "border-red-300 bg-red-50/30"
                    : notice.is_pinned
                    ? "border-purple-200 bg-purple-50/20"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Badges & Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                      {notice.category}
                    </span>
                    {notice.is_pinned && (
                      <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800">
                        📌 Pinned
                      </span>
                    )}
                    {notice.is_urgent && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 animate-pulse">
                        🚨 Urgent
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {notice.published_at
                        ? new Date(notice.published_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Recently Published"}
                    </span>
                  </div>

                  {/* Attachment Download Action */}
                  {notice.attachment_url && (
                    <a
                      href={notice.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition shadow-2xs shrink-0"
                    >
                      {isPdf && <span>📄 Download PDF</span>}
                      {isImage && <span>🖼️ View Picture</span>}
                      {isWord && <span>📘 Download Word Doc</span>}
                      {!isPdf && !isImage && !isWord && <span>📥 Download File</span>}
                    </a>
                  )}
                </div>

                {/* Title */}
                <h2 className="mt-3 text-lg font-bold text-gray-900 leading-snug">
                  {notice.title}
                </h2>

                {/* Picture Preview if Image */}
                {isImage && notice.attachment_url && (
                  <div className="mt-3 max-w-md overflow-hidden rounded-lg border bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={notice.attachment_url}
                      alt={notice.title}
                      className="w-full object-cover max-h-80"
                    />
                  </div>
                )}

                {/* Notice Body: Plain Text with Preserved Linebreaks */}
                {notice.content && (
                  <div className="mt-2.5 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {notice.content.replace(/<[^>]*>/g, "")}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
