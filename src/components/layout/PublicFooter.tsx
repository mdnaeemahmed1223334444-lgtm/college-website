import Link from "next/link";
import { getFooterSettings, getSocialLinksSettings, getBrandingSettings } from "@/features/website/queries";

export default async function PublicFooter() {
  const [footer, social, branding] = await Promise.all([
    getFooterSettings(),
    getSocialLinksSettings(),
    getBrandingSettings(),
  ]);

  const collegeName = branding.collegeName || "Dhaka Model College";

  return (
    <footer className="site-footer" id="contact">
      <div className="max-w-7xl mx-auto px-4">
        <div className="footer-grid">
          {/* Col 1: About & Logo */}
          <div className="footer-about">
            <Link href="/" className="logo flex items-center gap-3 text-white group mb-3">
              <div className="logo-symbol">
                <span>D</span>
              </div>
              <div className="logo-text">
                <strong className="font-serif text-xl font-medium tracking-tight block text-white">
                  {collegeName}
                </strong>
                <small className="text-[#dfc89f] text-[9px] tracking-[2px] uppercase block font-semibold">
                  College &amp; Institution
                </small>
              </div>
            </Link>

            <p>
              {footer.aboutText ||
                "Dedicated to academic excellence, moral integrity, and technological competence for higher secondary education in Bangladesh."}
            </p>

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
          <span>
            {footer.copyrightText || `© ${new Date().getFullYear()} ${collegeName}. All Rights Reserved.`}
          </span>
          <span className="text-[#a7b0bc]">Designed with Academic Excellence.</span>
        </div>
      </div>
    </footer>
  );
}
