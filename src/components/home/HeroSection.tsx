import Link from "next/link";
import { getHomepageSettings } from "@/features/website/queries";

export default async function HeroSection() {
  const homepage = await getHomepageSettings();

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 p-8 text-white shadow-md sm:p-14">
      {homepage.bannerImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${homepage.bannerImageUrl})` }}
        />
      )}
      <div className="relative z-10 max-w-3xl space-y-4">
        <span className="inline-block rounded-full bg-blue-500/30 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 uppercase">
          Welcome to Campus
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
          {homepage.heroTitle}
        </h1>
        {homepage.heroSubtitle && (
          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
            {homepage.heroSubtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-3">
          {homepage.heroCtaText && (
            <Link
              href={homepage.heroCtaLink || "/admission/apply"}
              className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-400"
            >
              {homepage.heroCtaText}
            </Link>
          )}
          {homepage.heroSecondaryText && (
            <Link
              href={homepage.heroSecondaryLink || "/academic/courses"}
              className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              {homepage.heroSecondaryText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
