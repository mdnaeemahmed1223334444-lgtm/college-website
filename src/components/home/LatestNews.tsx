import Link from "next/link";
import { getNewsEvents } from "@/features/content/queries";

export default async function LatestNews() {
  const news = await getNewsEvents({ limit: 3 });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 animate-fadeInUp delay-300">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm shadow">
            📰
          </div>
          <h2 className="font-extrabold text-gray-900 text-base">News &amp; Events</h2>
        </div>
        <Link href="/information/news-events" className="text-xs font-semibold text-blue-700 hover:underline">
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {news.map((item, i) => (
          <article
            key={item.id}
            className="flex gap-3 items-start group animate-fadeInUp"
            style={{ animationDelay: `${i * 100 + 300}ms` }}
          >
            {item.cover_image_url && (
              <div
                className="h-16 w-20 shrink-0 rounded-lg bg-cover bg-center border border-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.cover_image_url})` }}
              />
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase inline-block">
                {item.type}
              </span>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1 transition">
                {item.title}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-1">
                {item.summary || item.venue}
              </p>
              <div className="text-[10px] text-gray-400">
                {item.published_at ? new Date(item.published_at).toLocaleDateString() : ""}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
