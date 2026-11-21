import Link from "next/link";
import { getNewsEvents } from "@/features/content/queries";

export default async function PublicNewsEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const items = await getNewsEvents({
    type: type === "news" || type === "event" ? type : undefined,
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/information" className="hover:text-blue-600">Information</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">News & Events</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Campus News & Events</h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover student accomplishments, cultural highlights, departmental seminars, and upcoming functions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Link
          href="/information/news-events"
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            !type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Stories
        </Link>
        <Link
          href="/information/news-events?type=news"
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            type === "news" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          News & Press
        </Link>
        <Link
          href="/information/news-events?type=event"
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
            type === "event" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Upcoming & Past Events
        </Link>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition hover:shadow-md"
          >
            <div>
              {item.cover_image_url ? (
                <div
                  className="h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.cover_image_url})` }}
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-400 text-xs">
                  No Image Available
                </div>
              )}

              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.type === "event" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-gray-400">{item.category}</span>
                </div>

                <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
                  {item.title}
                </h2>

                {item.summary && (
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                {item.event_date && (
                  <div className="pt-2 text-xs text-gray-500 font-medium">
                    📅 {new Date(item.event_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {item.venue ? ` &bull; 📍 ${item.venue}` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50 text-xs text-gray-400 flex items-center justify-between">
              <span>
                {item.published_at ? new Date(item.published_at).toLocaleDateString() : "Recent"}
              </span>
              <span className="font-semibold text-blue-600">Read details &rarr;</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
