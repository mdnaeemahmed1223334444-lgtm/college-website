import Link from "next/link";
import { getNewsEvents } from "@/features/content/queries";

export default async function LatestNews() {
  const news = await getNewsEvents({ limit: 3 });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📰</span>
          <h2 className="font-bold text-gray-900 text-base">News & Events</h2>
        </div>
        <Link href="/information/news-events" className="text-xs font-semibold text-blue-700 hover:underline">
          View all stories &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {news.map((item) => (
          <article key={item.id} className="flex gap-3 items-start group">
            {item.cover_image_url && (
              <div
                className="h-16 w-20 shrink-0 rounded-md bg-cover bg-center border"
                style={{ backgroundImage: `url(${item.cover_image_url})` }}
              />
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 uppercase">
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
