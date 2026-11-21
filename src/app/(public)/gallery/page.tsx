import Link from "next/link";
import { getGalleryAlbums } from "@/features/content/queries";

export default async function PublicGalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Campus Gallery</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Photo & Media Gallery</h1>
        <p className="mt-1 text-sm text-gray-500">
          Glimpses of campus life, science fairs, sports tournaments, laboratories, and annual celebrations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <div
            key={album.id}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition hover:shadow-lg"
          >
            <div className="relative overflow-hidden h-52 w-full bg-gray-100">
              <div
                className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${album.cover_image_url})` }}
              />
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
                  {album.category}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition">
                {album.title}
              </h2>
              {album.description && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {album.description}
                </p>
              )}
            </div>

            <div className="border-t p-3.5 bg-gray-50 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>View Album Photos</span>
              <span>&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
