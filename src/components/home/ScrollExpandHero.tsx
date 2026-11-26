import Link from "next/link";
import ScrollExpand from "@/components/ui/animations/scroll-expand/ScrollExpand";
import HeroSection from "@/components/home/HeroSection";
import {
  getScrollExpandHeroSettings,
  getBrandingSettings,
  getHomepageSettings,
} from "@/features/website/queries";

export default async function ScrollExpandHero() {
  const [expandSettings, branding, homepage] = await Promise.all([
    getScrollExpandHeroSettings(),
    getBrandingSettings(),
    getHomepageSettings(),
  ]);

  // If administrator turned off ScrollExpand, smoothly fall back to classic HeroSection
  if (!expandSettings.enabled) {
    return <HeroSection />;
  }

  const collegeName = branding.collegeName || "Dhaka Model College";
  const heroImage =
    expandSettings.heroImage ||
    homepage.bannerImageUrl ||
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90";

  const heroTitle = expandSettings.heroTitle || homepage.heroTitle || "Where Minds Meet Possibilities";
  const heroSubtitle =
    expandSettings.heroSubtitle ||
    homepage.heroSubtitle ||
    "Building knowledge, character, and a brighter future through academic excellence and modern innovation.";

  const ctaText = expandSettings.ctaText || homepage.heroCtaText || "DISCOVER ADMISSION ↗";
  const ctaLink = expandSettings.ctaLink || homepage.heroCtaLink || "/admission/apply";
  const secondaryCtaText = expandSettings.secondaryCtaText || homepage.heroSecondaryText || "EXPLORE ACADEMICS";
  const secondaryCtaLink = expandSettings.secondaryCtaLink || homepage.heroSecondaryLink || "/academic/courses";
  const scrollHint = expandSettings.scrollHint || "Scroll to explore";

  return (
    <div id="home" className="relative w-full">
      <ScrollExpand
        src={heroImage}
        alt={`${collegeName} campus`}
        title={heroTitle}
        scrollHint={scrollHint}
        startWidth={expandSettings.startWidth ?? 42}
        startHeight={expandSettings.startHeight ?? 58}
        startRadius={expandSettings.startRadius ?? 24}
        endRadius={expandSettings.endRadius ?? 0}
        mediaZoom={expandSettings.mediaZoom ?? 1.35}
        scrollDistance={expandSettings.scrollDistance ?? 1.2}
        holdDistance={expandSettings.holdDistance ?? 0.35}
        smoothing={expandSettings.smoothing ?? 0.1}
        overlayScrim={expandSettings.overlayScrim ?? 0.45}
        useWindowScroll
        enabled={expandSettings.enabled}
      >
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="eyebrow text-[#dfc89f] tracking-[4px] font-bold text-[11px] uppercase mb-2">
            WELCOME TO {collegeName.toUpperCase()}
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-white drop-shadow-md">
            {heroTitle}
          </h2>
          <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-sans drop-shadow-sm">
            {heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={ctaLink}
              className="btn btn-primary shadow-xl hover:scale-105 transition-transform"
            >
              {ctaText}
            </Link>
            {secondaryCtaText && (
              <Link
                href={secondaryCtaLink}
                className="btn btn-outline backdrop-blur-sm hover:scale-105 transition-transform"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </ScrollExpand>
    </div>
  );
}
