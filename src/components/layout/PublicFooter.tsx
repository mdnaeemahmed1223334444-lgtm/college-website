import Link from "next/link";
import { getFooterSettings, getSocialLinksSettings, getBrandingSettings } from "@/features/website/queries";
import type { BrandingSettings } from "@/features/website/types";

export default async function PublicFooter({
  branding: propBranding,
}: {
  branding?: BrandingSettings;
} = {}) {
  const [footer, social, fetchedBranding] = await Promise.all([
    getFooterSettings(),
    getSocialLinksSettings(),
    propBranding ? Promise.resolve(propBranding) : getBrandingSettings(),
  ]);

  const branding = propBranding || fetchedBranding;
  const collegeName = branding.collegeName || "Dhaka Model College";
  const shortName = branding.shortName || "DMC";
  const logoUrl = branding.logoUrl;
  const motto = branding.motto || "Excellence in Education, Character, and Innovation";
  const initialLetter = (shortName || collegeName || "D").charAt(0).toUpperCase();

  // If the stored footer text still mentions the default placeholder name, replace it seamlessly
  const aboutText = footer.aboutText
    ? footer.aboutText.replace(/Dhaka Model College/g, collegeName)
    : `Dedicated to academic excellence, moral integrity, and technological competence for higher secondary education at ${collegeName}.`;

  const copyrightText = footer.copyrightText
    ? footer.copyrightText.replace(/Dhaka Model College/g, collegeName)
    : `© ${new Date().getFullYear()} ${collegeName}. All rights reserved.`;

  return (
    <footer className="site-footer" id="contact">
      <div className="max-w-7xl mx-auto px-4">
        <div className="footer-grid">
          {/* Col 1: About & Logo */}
          <div className="footer-about">
            <Link href="/" className="logo flex items-center gap-3 text-white group mb-3">
              {logoUrl ? (
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg overflow-hidden bg-white/10 border border-[#c5a46d]/40 flex items-center justify-center p-1 shrink-0 backdrop-blur-xs transition-all duration-300 group-hover:scale-105 group-hover:border-[#c5a46d] shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={collegeName}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="logo-symbol shrink-0">
                  <span>{initialLetter}</span>
                </div>
              )}
              <div className="logo-text">
                <strong className="font-serif text-xl font-medium tracking-tight block text-white leading-tight">
                  {collegeName}
                </strong>
                <small className="text-[#dfc89f] text-[9px] tracking-[2px] uppercase block font-semibold truncate max-w-[280px]">
                  {shortName && shortName !== collegeName ? `${shortName} • ` : ""}
                  {motto}
                </small>
              </div>
            </Link>

            <p>{aboutText}</p>

            {/* Social links */}
            <div className="flex flex-wrap gap-2 mt-5">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 hover:border-[#c5a46d] hover:text-[#dfc89f] transition-colors"
                >
                  Facebook
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 hover:border-[#c5a46d] hover:text-[#dfc89f] transition-colors"
                >
                  YouTube
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 text-[11px] bg-white/5 border border-white/10 hover:border-[#c5a46d] hover:text-[#dfc89f] transition-colors"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link href="/">Home</Link>
            <Link href="/about/overview">About Us</Link>
            <Link href="/academic/courses">Academic Programs</Link>
            <Link href="/academic/class-routine">Class Routine</Link>
            <Link href="/gallery">Campus Photo Gallery</Link>
          </div>

          {/* Col 3: Information & Portals */}
          <div className="footer-col">
            <h4>Information</h4>
            <Link href="/notices">Latest Notices &amp; Circulars</Link>
            <Link href="/admission/apply">Online Admission Application</Link>
            <Link href="/academic/academic-calendar">Academic Calendar</Link>
            <Link href="/information/holidays">Holidays List</Link>
            <Link href="/login">Portal Login (Student / Teacher)</Link>
          </div>

          {/* Col 4: Contact Us */}
          <div className="footer-col">
            <h4>Contact Campus</h4>
            <span className="block text-[#a7b0bc] text-xs mb-3 leading-relaxed">
              {footer.address || "Mirpur-12, Dhaka-1216, Bangladesh"}
            </span>
            {footer.phone && (
              <a href={`tel:${footer.phone}`} className="!mb-2">
                📞 {footer.phone}
              </a>
            )}
            {footer.email && (
              <a href={`mailto:${footer.email}`} className="!mb-2">
                ✉️ {footer.email}
              </a>
            )}
            {footer.emergencyHelpline && (
              <span className="block text-[#dfc89f] text-xs mt-3 font-semibold">
                🚨 Helpline: {footer.emergencyHelpline}
              </span>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span>{copyrightText}</span>
          <span className="text-[#a7b0bc]">Designed with Academic Excellence.</span>
        </div>
      </div>
    </footer>
  );
}
