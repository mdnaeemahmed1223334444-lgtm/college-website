import Link from "next/link";
import { getAllGalleryItems, getGalleryAlbums } from "@/features/content/queries";
import { getBrandingSettings } from "@/features/website/queries";
import PublicGalleryViewer from "@/components/gallery/PublicGalleryViewer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicGalleryPage() {
  const [items, albums, branding] = await Promise.all([
    getAllGalleryItems(),
    getGalleryAlbums(),
    getBrandingSettings(),
  ]);

  const pool: { id: string; url: string; title: string | null }[] = [];
  const seenUrls = new Set<string>();

  // 1. Add all individual photos uploaded to the database
  if (items && items.length > 0) {
    items.forEach((it) => {
      const url = it.thumbnail_url || it.media_url;
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        pool.push({
          id: it.id,
          url,
          title: it.title,
        });
      }
    });
  }

  // 2. Add real published album cover photos if not already added
  if (albums && albums.length > 0) {
    albums.forEach((alb) => {
      if (alb.cover_image_url && !seenUrls.has(alb.cover_image_url)) {
        seenUrls.add(alb.cover_image_url);
        pool.push({
          id: alb.id,
          url: alb.cover_image_url,
          title: alb.title,
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#101f32] p-8 sm:p-12 text-white relative overflow-hidden border border-[#c5a46d]/30 shadow-xl reveal">
        <div className="relative z-10">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#dfc89f] font-semibold">Photo &amp; Media Gallery</span>
          </nav>

          <span className="eyebrow text-[#dfc89f]">Visual Archive</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white mb-3">
            Photo &amp; Media Gallery
          </h1>
          <p className="text-[#aeb8c4] text-sm sm:text-base max-w-2xl leading-relaxed">
            Capturing the vibrant spirit of {branding.collegeName || "our college"} &mdash; academic excellence,
            scientific innovations, campus life, sports tournaments, and milestone celebrations.
          </p>
          <div className="gold-line" />
        </div>
      </div>

      {/* Unified Photo & Media Gallery */}
      <PublicGalleryViewer initialPhotos={pool} />
    </div>
  );
}
