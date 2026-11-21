import Link from "next/link";
import { getHomepageSettings } from "@/features/website/queries";

export default async function NoticeTicker() {
  const homepage = await getHomepageSettings();
  const notices = homepage.noticeTickerText
    ? homepage.noticeTickerText.split("|").map((n) => n.trim()).filter(Boolean)
    : ["Pre-board examination schedule has been published."];

  return (
    <section className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3 shadow-xs">
      <div className="flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-1 text-xs font-bold text-white uppercase shrink-0">
        <span>📢</span>
        <span>Notice</span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-8 text-xs font-medium text-blue-900 truncate">
          {notices.map((notice, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span>&bull;</span>
              <span>{notice}</span>
            </span>
          ))}
        </div>
      </div>

      <Link
        href="/notices"
        className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0"
      >
        View all notices &rarr;
      </Link>
    </section>
  );
}
