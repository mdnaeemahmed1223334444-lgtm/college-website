import Link from "next/link";
import { getNotices } from "@/features/content/queries";

export default async function HomeNotices() {
  const notices = await getNotices({ limit: 4 });

  function formatNoticeDate(dateStr?: string) {
    if (!dateStr) return { day: "24", month: "NOV" };
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    return { day, month };
  }

  return (
    <section className="section" id="notices">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="section-heading reveal mb-0">
            <span className="eyebrow">Stay Informed</span>
            <h2 className="section-title">Latest News &amp; Announcements</h2>
            <p className="section-description">
              Keep up with official circulars, examination routines, and academic notices.
            </p>
            <div className="gold-line" />
          </div>

          <div className="mt-6 md:mt-0 reveal">
            <Link href="/notices" className="btn btn-outline !border-[#101f32]/30 !text-[#101f32] hover:!bg-[#101f32] hover:!text-white">
              VIEW ALL NOTICES ↗
            </Link>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 notice-grid">
          {notices.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center text-gray-500 border border-dashed border-[#e9e5dc]">
              No active notices published at this moment.
            </div>
          ) : (
            notices.map((n, i) => {
              const { day, month } = formatNoticeDate(n.published_at || n.created_at);
              const isPdf = n.attachment_url?.endsWith(".pdf");

              return (
                <Link
                  key={n.id}
                  href={`/notices?category=${encodeURIComponent(n.category)}`}
                  className={`notice-card reveal ${i % 2 === 1 ? "reveal-delay-1" : ""}`}
                >
                  {/* Rotating date block */}
                  <div className="notice-date">
                    <strong>{day}</strong>
                    <small>{month}</small>
                  </div>

                  {/* Content */}
                  <div className="notice-content flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <small>{n.category || "General Announcement"}</small>
                      {n.is_urgent && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 animate-pulse">
                          Urgent
                        </span>
                      )}
                      {isPdf && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                          PDF
                        </span>
                      )}
                    </div>

                    <h3>{n.title}</h3>

                    {n.content && (
                      <p className="line-clamp-2">
                        {n.content.replace(/<[^>]*>/g, "")}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
