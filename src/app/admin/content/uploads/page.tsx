import { getAllGalleryItems, getGalleryAlbums } from "@/features/content/queries";
import MediaUploadsManager from "@/components/admin/content/MediaUploadsManager";

export const dynamic = "force-dynamic";

export default async function MediaUploadsPage() {
  const [photos, albums] = await Promise.all([
    getAllGalleryItems(),
    getGalleryAlbums(),
  ]);

  return <MediaUploadsManager initialPhotos={photos} albums={albums} />;
}
