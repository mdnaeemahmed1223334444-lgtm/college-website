import Link from "next/link";
import { getHomepageSettings, getBrandingSettings } from "@/features/website/queries";

export default async function HeroSection() {
  const [homepage, branding] = await Promise.all([
    getHomepageSettings(),
    getBrandingSettings(),
  ]);

  const collegeName = branding.collegeName || "Dhaka Model College";

  const backgroundUrl =
    homepage.bannerImageUrl ||
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=90";

  return (
    <section className="hero" id="home">
      {/* Zooming background image */}
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />

      {/* Navy gradient overlay */}
      <div className="hero-overlay" />

      {/* Hero content */}
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="hero-content">
          <div className="eyebrow text-[#dfc89f] tracking-[4px] font-bold text-[11px] mb-6">
            WELCOME TO {collegeName.toUpperCase()}
          </div>

          <h1 className="font-serif text-[clamp(42px,6.5vw,78px)] font-normal leading-[1.08] mb-6 text-white">
            Where Minds<br />
            Meet <span className="text-[#dfc89f] italic">Possibilities.</span>
          </h1>

          <p className="text-[#d5d8dc] text-sm sm:text-base leading-[1.9] max-w-[540px] mb-9">
            {homepage.heroSubtitle ||
              "Education is more than acquiring knowledge. It is about discovering potential, developing character, and preparing for a meaningful future."}
          </p>

          <div className="flex flex-wrap gap-4 hero-buttons">
            <Link
              href={homepage.heroCtaLink || "/admission/apply"}
              className="btn btn-primary"
            >
              {homepage.heroCtaText || "DISCOVER ADMISSION ↗"}
            </Link>

            <Link
              href={homepage.heroSecondaryLink || "/academic/courses"}
              className="btn btn-outline"
            >
              {homepage.heroSecondaryText || "EXPLORE ACADEMICS"}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator with animated vertical line */}
      <div className="hero-scroll">Scroll to explore</div>
    </section>
  );
}
