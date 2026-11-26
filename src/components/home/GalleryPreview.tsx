import Link from "next/link";
import { getRandomGalleryPhotos } from "@/features/content/queries";
import { isMeaningfulTitle } from "@/features/content/types";

export default async function GalleryPreview() {
  const photos = await getRandomGalleryPhotos(8);

  return (
    <section className="space-y-4 animate-fadeInUp delay-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md text-lg">
            🖼️
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Campus Gallery</h2>
            <p className="text-xs text-gray-500">Moments from campus life</p>
          </div>
        </div>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow hover:shadow-md hover:scale-105 transition-all duration-200"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      {/* Masonry-style grid */}
      {photos.length > 0 ? (
        <div className="photo-masonry">
          {photos.map((photo, i) => {
            const hasTitle = isMeaningfulTitle(photo.title);
            return (
              <Link
                key={photo.id}
                href="/gallery"
                className="photo-masonry-item relative group block overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scaleIn bg-gray-100"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={hasTitle ? (photo.title as string) : "Gallery photo"}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Hover overlay only if meaningful title exists */}
                {hasTitle && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 rounded-xl">
                    <span className="text-[11px] font-semibold text-white leading-tight line-clamp-2">
                      {photo.title}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        /* No photos yet — show a nice call-to-action */
        <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50 p-10 text-center space-y-3">
          <div className="text-5xl">🏫</div>
          <p className="text-sm font-semibold text-gray-700">No photos added yet</p>
          <p className="text-xs text-gray-500">Upload photos from the Admin panel to showcase campus life here.</p>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pink-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-pink-600 transition"
          >
            Go to Gallery
          </Link>
        </div>
      )}
    </section>
  );
}
