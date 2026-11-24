import type { Metadata } from "next";
import "./globals.css";
import { getBrandingSettings, getSeoSettings } from "@/features/website/queries";

export async function generateMetadata(): Promise<Metadata> {
  const [branding, seo] = await Promise.all([
    getBrandingSettings(),
    getSeoSettings(),
  ]);

  const collegeName = branding.collegeName || "Dhaka Model College";
  const title = seo.metaTitle || `${collegeName} — Excellence in Education`;
  const description =
    seo.metaDescription ||
    branding.motto ||
    "A distinguished higher secondary college committed to academic brilliance, moral virtues, and modern learning.";

  const icons: Metadata["icons"] = {};
  if (branding.faviconUrl) {
    icons.icon = branding.faviconUrl;
  } else if (branding.logoUrl) {
    icons.icon = branding.logoUrl;
  }

  return {
    title: {
      default: title,
      template: `%s | ${branding.shortName || collegeName}`,
    },
    description,
    keywords: seo.keywords || undefined,
    icons: Object.keys(icons).length > 0 ? icons : undefined,
    openGraph: {
      title,
      description,
      images: seo.ogImageUrl
        ? [{ url: seo.ogImageUrl }]
        : branding.logoUrl
        ? [{ url: branding.logoUrl }]
        : undefined,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
