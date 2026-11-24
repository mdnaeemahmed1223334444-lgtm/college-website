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

  function formatNoticeDate(dateStr?: string) {
    if (!dateStr) return { day: "24", month: "NOV", year: "2026" };
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return { day, month, year };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#7b8490]">
        <Link href="/" className="hover:text-[#101f32]">Home</Link>
        <span>/</span>
        <span className="font-semibold text-[#101f32]">Notices</span>
      </nav>

      {/* Header */}
      <div className="bg-[#101f32] p-8 sm:p-10 text-white relative overflow-hidden border border-[#c5a46d]/30 shadow-xl reveal">
        <div className="relative z-10">
          <span className="eyebrow text-[#dfc89f]">Official Communications</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight text-white mb-2">
            Notices &amp; Circulars
          </h1>
          <p className="text-[#aeb8c4] text-sm max-w-xl leading-relaxed">
            All formal notices, examination routines, holiday schedules, and institutional announcements.
          </p>
          <div className="gold-line" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 reveal">
        {categories.map((c) => {
          const isActive = (!category && c === "all") || category?.toLowerCase() === c.toLowerCase();
          return (
            <Link
              key={c}
              href={c === "all" ? "/notices" : `/notices?category=${encodeURIComponent(c)}`}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                isActive
                  ? "bg-[#c5a46d] text-[#101f32] shadow-md"
                  : "bg-white border border-[#e9e5dc] text-[#283444] hover:border-[#c5a46d] hover:text-[#c5a46d]"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 notice-grid">
        {notices.length === 0 ? (
          <div className="col-span-full bg-white border border-[#e9e5dc] p-12 text-center text-[#7b8490]">
            <p className="text-base font-semibold text-[#101f32]">No notices in this category</p>
            <p className="text-xs text-[#7b8490] mt-1">Please check back soon or browse all categories.</p>
          </div>
        ) : (
          notices.map((notice, i) => {
            const { day, month } = formatNoticeDate(notice.published_at || notice.created_at);
            const isPdf = notice.attachment_type === "pdf" || notice.attachment_url?.endsWith(".pdf");

            return (
              <div
                key={notice.id}
                className={`notice-card reveal flex items-start gap-4 ${i % 2 === 1 ? "reveal-delay-1" : ""}`}
              >
                {/* Rotating date block */}
                <div className="notice-date">
                  <strong>{day}</strong>
                  <small>{month}</small>
                </div>

                <div className="notice-content flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <small>{notice.category}</small>
                    {notice.is_urgent && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 animate-pulse">
                        🚨 Urgent
                      </span>
                    )}
                    {notice.is_pinned && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700">
                        📌 Pinned
                      </span>
                    )}
                  </div>

                  <h3>{notice.title}</h3>

                  {notice.content && (
                    <p className="line-clamp-3">
                      {notice.content.replace(/<[^>]*>/g, "")}
                    </p>
                  )}

                  {notice.attachment_url && (
                    <div className="mt-4 pt-3 border-t border-[#e9e5dc]">
                      <a
                        href={notice.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c5a46d] hover:text-[#101f32] transition"
                      >
                        {isPdf ? "📄 Download Official PDF ↗" : "📥 View Attachment ↗"}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
