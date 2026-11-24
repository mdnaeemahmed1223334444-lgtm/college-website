import Link from "next/link";
import { getHomepageSettings } from "@/features/website/queries";

export default async function HeroSection() {
  const homepage = await getHomepageSettings();

  return (
    <section className="relative overflow-hidden rounded-2xl text-white shadow-2xl min-h-[340px] sm:min-h-[460px] flex items-center">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-bgPan"
        style={{
          background:
            "linear-gradient(135deg, #0f2457 0%, #1a3a8f 30%, #1e3a8a 50%, #312e81 75%, #1e1b4b 100%)",
          backgroundSize: "300% 300%",
        }}
      />

      {/* Optional banner image overlay */}
      {homepage.bannerImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${homepage.bannerImageUrl})` }}
        />
      )}

      {/* Decorative floating orbs */}
      <div
        className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-20 animate-floatY"
        style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-80px] left-[-40px] w-80 h-80 rounded-full opacity-15 animate-floatY delay-400"
        style={{
          background: "radial-gradient(circle, #818cf8 0%, transparent 70%)",
          animationDuration: "7s",
        }}
      />
      <div
        className="absolute top-1/2 right-[15%] w-40 h-40 rounded-full opacity-10 animate-floatY delay-200"
        style={{
          background: "radial-gradient(circle, #34d399 0%, transparent 70%)",
          animationDuration: "6s",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0v1h40V0zm0 39v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-6 py-12 sm:px-14 sm:py-16 lg:py-20">
        <div className="max-w-3xl space-y-5">
          {/* Badge */}
          <span className="animate-fadeInUp inline-flex items-center gap-2 rounded-full glass-blue px-4 py-1.5 text-xs font-bold tracking-widest text-blue-200 uppercase border border-blue-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Welcome to Campus
          </span>

          {/* Title */}
          <h1 className="animate-fadeInUp delay-100 text-3xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl">
            {homepage.heroTitle}
          </h1>

          {/* Subtitle */}
          {homepage.heroSubtitle && (
            <p className="animate-fadeInUp delay-200 text-sm sm:text-lg text-blue-100/85 leading-relaxed max-w-2xl">
              {homepage.heroSubtitle}
            </p>
          )}

          {/* Stats row */}
          <div className="animate-fadeInUp delay-300 flex flex-wrap gap-4 pt-1">
            {[
              { label: "Students", value: "3,000+" },
              { label: "Faculty", value: "120+" },
              { label: "Established", value: "1958" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                <div className="text-lg sm:text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-blue-200/80 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="animate-fadeInUp delay-400 flex flex-wrap gap-3 pt-2">
            {homepage.heroCtaText && (
              <Link
                href={homepage.heroCtaLink || "/admission/apply"}
                className="rounded-xl bg-blue-500 hover:bg-blue-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-100"
              >
                {homepage.heroCtaText}
              </Link>
            )}
            {homepage.heroSecondaryText && (
              <Link
                href={homepage.heroSecondaryLink || "/academic/courses"}
                className="rounded-xl glass border border-white/25 px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-100"
              >
                {homepage.heroSecondaryText}
              </Link>
            )}
            <Link
              href="/gallery"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-blue-200 transition-all duration-200 hover:text-white hover:border-white/30 hover:scale-105 active:scale-100"
            >
              📸 View Gallery
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
