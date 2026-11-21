import Link from "next/link";
import { getGalleryAlbums } from "@/features/content/queries";

export default async function GalleryPreview() {
  const albums = await getGalleryAlbums();
  const displayAlbums = albums.slice(0, 4);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <h2 className="font-bold text-gray-900 text-base">Campus Photo Gallery</h2>
        </div>
        <Link href="/gallery" className="text-xs font-semibold text-blue-700 hover:underline">
          Explore all albums &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {displayAlbums.map((album) => (
          <Link
            key={album.id}
            href="/gallery"
            className="group relative overflow-hidden rounded-lg aspect-4/3 bg-gray-100 block"
          >
            <div
              className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-110"
              style={{ backgroundImage: `url(${album.cover_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-semibold text-white line-clamp-1 leading-tight">
                {album.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
