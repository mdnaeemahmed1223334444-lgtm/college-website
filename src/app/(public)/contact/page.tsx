import Link from "next/link";
import { getFooterSettings } from "@/features/website/queries";

export const metadata = {
  title: "Contact Us - Dhaka Model College",
  description: "Get in touch with Dhaka Model College. Campus location, telephone, email, and admissions office.",
};

export default async function ContactPage() {
  const footer = await getFooterSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="bg-[#101f32] p-8 sm:p-12 text-white relative overflow-hidden border border-[#c5a46d]/30 shadow-xl reveal">
        <div className="relative z-10">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-[#dfc89f] font-semibold">Contact Us</span>
          </nav>

          <span className="eyebrow text-[#dfc89f]">Get In Touch</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white mb-3">
            Contact Dhaka Model College
          </h1>
          <p className="text-[#aeb8c4] text-sm sm:text-base max-w-2xl leading-relaxed">
            Our administration and admissions team are ready to answer your inquiries, schedule a
            campus visit, or assist with student services.
          </p>
          <div className="gold-line" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6 reveal">
          <div className="bg-white border border-[#e9e5dc] p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-2xl text-[#101f32] font-medium">Campus Information</h2>

            <div className="space-y-4 text-sm text-[#283444]">
              <div>
                <strong className="block text-[#101f32] text-xs uppercase tracking-wider text-[#c5a46d]">
                  Campus Location
                </strong>
                <p className="mt-1 text-[#7b8490]">{footer.address || "Mirpur-12, Dhaka-1216, Bangladesh"}</p>
              </div>

              <div>
                <strong className="block text-[#101f32] text-xs uppercase tracking-wider text-[#c5a46d]">
                  Telephone &amp; Mobile
                </strong>
                <p className="mt-1 text-[#7b8490]">{footer.phone || "+880 2-9012345, +880 1712-345678"}</p>
              </div>

              <div>
                <strong className="block text-[#101f32] text-xs uppercase tracking-wider text-[#c5a46d]">
                  Email Inquiries
                </strong>
                <p className="mt-1 text-[#7b8490]">{footer.email || "info@dhakamodelcollege.edu.bd"}</p>
              </div>

              {footer.emergencyHelpline && (
                <div>
                  <strong className="block text-[#101f32] text-xs uppercase tracking-wider text-[#c5a46d]">
                    Emergency Helpline
                  </strong>
                  <p className="mt-1 font-semibold text-[#101f32]">{footer.emergencyHelpline}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white border border-[#e9e5dc] p-6 sm:p-8 space-y-4 reveal reveal-delay-1">
          <h2 className="font-serif text-2xl text-[#101f32] font-medium">Send a Message</h2>
          <p className="text-xs text-[#7b8490]">
            Fill out the form below and our office will get back to you shortly.
          </p>

          <form className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#101f32] uppercase mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mohammad Rahman"
                className="w-full border border-[#e9e5dc] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101f32] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full border border-[#e9e5dc] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101f32] uppercase mb-1">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="How can we assist you?"
                className="w-full border border-[#e9e5dc] px-3.5 py-2.5 text-sm"
              />
            </div>

            <button type="button" className="btn btn-primary w-full">
              SEND MESSAGE ↗
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
