import Link from "next/link";
import { getHomepageSettings } from "@/features/website/queries";

export default async function NoticeTicker() {
  const homepage = await getHomepageSettings();
  const notices = homepage.noticeTickerText
    ? homepage.noticeTickerText.split("|").map((n) => n.trim()).filter(Boolean)
    : ["Pre-board examination schedule has been published.", "Admission for HSC 2026-27 is now open.", "Sports meet registration deadline: Dec 1."];

  // Build a long string for smooth scrolling
  const tickerText = notices.map((n) => `📢 ${n}`).join("   ·   ");

  return (
    <section className="animate-fadeIn flex items-center gap-0 overflow-hidden rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-700 to-indigo-700 shadow-md text-white h-11">
      {/* Label */}
      <div className="flex shrink-0 items-center gap-1.5 h-full px-3 sm:px-4 bg-blue-900/60 font-bold text-xs sm:text-sm uppercase tracking-wider border-r border-white/20">
        <span className="text-yellow-300">📢</span>
        <span className="hidden sm:inline">Notice</span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-ticker whitespace-nowrap text-xs sm:text-sm font-medium text-blue-50 py-1 px-4 inline-block">
          {tickerText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{tickerText}
        </div>
      </div>

      {/* View all link */}
      <Link
        href="/notices"
        className="shrink-0 flex items-center gap-1 h-full px-3 sm:px-4 text-[11px] sm:text-xs font-bold text-yellow-200 hover:text-white border-l border-white/20 hover:bg-white/10 transition"
      >
        <span className="hidden sm:inline">View All</span>
        <span>→</span>
      </Link>
    </section>
  );
}
