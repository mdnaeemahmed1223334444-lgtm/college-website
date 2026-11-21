import Link from "next/link";
import { publicNav } from "@/config/navigation/public";
import { siteConfig } from "@/config/site";
import { getFooterSettings, getSocialLinksSettings, getBrandingSettings } from "@/features/website/queries";

export default async function PublicFooter() {
  const [footer, social, branding] = await Promise.all([
    getFooterSettings(),
    getSocialLinksSettings(),
    getBrandingSettings(),
  ]);

  const collegeName = branding.collegeName || siteConfig.name;

  return (
    <footer className="mt-16 border-t bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Col 1: About & Campus info */}
        <div className="space-y-3">
          <p className="text-lg font-bold text-white">{collegeName}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {footer.aboutText || siteConfig.description}
          </p>
          {footer.address && (
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Campus:</strong> {footer.address}
            </p>
          )}
          {footer.phone && (
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Tel:</strong> {footer.phone}
            </p>
          )}
          {footer.emergencyHelpline && (
            <p className="text-xs text-amber-400">
              <strong>Emergency Helpline:</strong> {footer.emergencyHelpline}
            </p>
          )}
        </div>

        {/* Col 2: About Nav */}
        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wider">About Us</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li><Link href="/about/overview" className="hover:text-white transition">Overview</Link></li>
            <li><Link href="/about/principals-message" className="hover:text-white transition">Principal&apos;s Message</Link></li>
            <li><Link href="/about/mission-vision" className="hover:text-white transition">Mission & Vision</Link></li>
            <li><Link href="/about/history" className="hover:text-white transition">College History</Link></li>
            <li><Link href="/about/management-committee" className="hover:text-white transition">Management Committee</Link></li>
          </ul>
        </div>

        {/* Col 3: Academic Nav */}
        <div>
          <p className="text-sm font-semibold text-white uppercase tracking-wider">Academic</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li><Link href="/academic/courses" className="hover:text-white transition">Academic Programs</Link></li>
            <li><Link href="/academic/departments-subjects" className="hover:text-white transition">Departments & Subjects</Link></li>
            <li><Link href="/academic/class-routine" className="hover:text-white transition">Class Routine</Link></li>
            <li><Link href="/academic/regulations" className="hover:text-white transition">Rules & Regulations</Link></li>
            <li><Link href="/academic/dress-code" className="hover:text-white transition">Uniform & Dress Code</Link></li>
          </ul>
        </div>

        {/* Col 4: Quick Portals & Social Media */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-white uppercase tracking-wider">Online Portals</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li><Link href="/login" className="hover:text-white transition">Portal Login (Student / Teacher / Admin)</Link></li>
              <li><Link href="/admission/apply" className="text-blue-400 hover:text-blue-300 transition">Online Admission Application</Link></li>
              <li><Link href="/notices" className="hover:text-white transition">Notices</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Connect With Us</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="rounded bg-gray-800 px-2.5 py-1 text-gray-300 hover:bg-blue-600 hover:text-white transition">
                  Facebook
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="rounded bg-gray-800 px-2.5 py-1 text-gray-300 hover:bg-red-600 hover:text-white transition">
                  YouTube
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="rounded bg-gray-800 px-2.5 py-1 text-gray-300 hover:bg-blue-700 hover:text-white transition">
                  LinkedIn
                </a>
              )}
              {social.whatsapp && (
                <a href={`https://wa.me/${social.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded bg-gray-800 px-2.5 py-1 text-gray-300 hover:bg-green-600 hover:text-white transition">
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        {footer.copyrightText || `© ${new Date().getFullYear()} ${collegeName}. All rights reserved.`}
      </div>
    </footer>
  );
}
