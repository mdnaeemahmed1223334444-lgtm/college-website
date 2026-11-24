import Link from "next/link";
import { getBrandingSettings } from "@/features/website/queries";

export default async function AdmissionCTA() {
  const branding = await getBrandingSettings();
  const collegeName = branding.collegeName || "Dhaka Model College";

  return (
    <section
      className="cta relative text-white"
      id="admission"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="cta-overlay" />

      <div className="max-w-7xl mx-auto px-4 relative z-10 text-center reveal">
        <span className="eyebrow text-[#dfc89f]">Your Future Starts Here</span>

        <h2>Take the First Step Towards Your Future</h2>

        <p>
          Every great journey begins with a single step. Discover the academic excellence,
          nurturing environment, and endless opportunities waiting for you at {collegeName}.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/admission/apply" className="btn btn-primary">
            APPLY FOR ADMISSION ↗
          </Link>

          <Link href="/admission" className="btn btn-outline">
            ADMISSION GUIDELINES
          </Link>
        </div>
      </div>
    </section>
  );
}
