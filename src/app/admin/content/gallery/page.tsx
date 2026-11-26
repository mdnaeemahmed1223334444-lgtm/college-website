import Link from "next/link";
import { getGalleryAlbums, getAllGalleryItems } from "@/features/content/queries";
import GalleryManager from "@/components/admin/content/GalleryManager";

export default async function GalleryManagementPage() {
  const [albums, photos] = await Promise.all([
    getGalleryAlbums(),
    getAllGalleryItems(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Gallery Management</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Photo &amp; Media Gallery Management</h1>
        <p className="text-sm text-gray-500">
          Upload individual photos for the home page showcase, create albums, and organize campus media.
        </p>
      </div>

      <GalleryManager albums={albums} initialPhotos={photos} />
    </div>
  );
}
