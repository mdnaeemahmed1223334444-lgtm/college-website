import Link from "next/link";
import { getRandomGalleryPhotos } from "@/features/content/queries";
import { getBrandingSettings } from "@/features/website/queries";
import { isMeaningfulTitle } from "@/features/content/types";

export default async function CampusGallery() {
  const [photos, branding] = await Promise.all([
    getRandomGalleryPhotos(6),
    getBrandingSettings(),
  ]);

  const collegeName = branding.collegeName || "Dhaka Model College";

  const fallbackPhotos = [
    {
      id: "f1",
      url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=85",
      title: null,
      description: null,
    },
    {
      id: "f2",
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85",
      title: null,
      description: null,
    },
    {
      id: "f3",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85",
      title: null,
      description: null,
    },
  ];

  const featurePhoto = photos[0] || fallbackPhotos[0];
  const sidePhoto1 = photos[1] || fallbackPhotos[1];
  const sidePhoto2 = photos[2] || fallbackPhotos[2];

  const showFeatureCaption = isMeaningfulTitle(featurePhoto.title);
  const showSide1Caption = isMeaningfulTitle(sidePhoto1.title);
  const showSide2Caption = isMeaningfulTitle(sidePhoto2.title);

  return (
    <section className="section campus" id="campus">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Heading with Explore Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="section-heading reveal mb-0">
            <span className="eyebrow">Life at {collegeName}</span>
            <h2 className="section-title">More Than Just a Classroom</h2>
            <p className="section-description">
              A place where friendships grow, ideas flourish, and unforgettable memories are created
              every single day.
            </p>
            <div className="gold-line" />
          </div>

          <div className="mt-6 md:mt-0 reveal">
            <Link href="/gallery" className="btn btn-primary">
              EXPLORE FULL GALLERY ↗
            </Link>
          </div>
        </div>

        {/* Asymmetrical Campus Grid */}
        <div className="campus-grid">
          {/* Main Large Feature Card */}
          <Link href="/gallery" className="campus-feature reveal-left block group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featurePhoto.url}
              alt={showFeatureCaption ? (featurePhoto.title as string) : "Campus Life"}
              loading="lazy"
            />
            {showFeatureCaption && (
              <div className="campus-feature-content">
                <h3>{featurePhoto.title}</h3>
                {"description" in featurePhoto && featurePhoto.description && isMeaningfulTitle(featurePhoto.description as string) && (
                  <p>{featurePhoto.description as string}</p>
                )}
              </div>
            )}
          </Link>

          {/* Right Side Stacked Items */}
          <div className="campus-side">
            <Link href="/gallery" className="gallery-item reveal-right block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sidePhoto1.url}
                alt={showSide1Caption ? (sidePhoto1.title as string) : "Campus Gallery"}
                loading="lazy"
              />
              {showSide1Caption && <h3>{sidePhoto1.title}</h3>}
            </Link>

            <Link href="/gallery" className="gallery-item reveal-right reveal-delay-1 block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sidePhoto2.url}
                alt={showSide2Caption ? (sidePhoto2.title as string) : "Campus Gallery"}
                loading="lazy"
              />
              {showSide2Caption && <h3>{sidePhoto2.title}</h3>}
            </Link>
          </div>
        </div>

        {/* Extra Random Photo Strip if more than 3 photos exist */}
        {photos.length > 3 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {photos.slice(3, 6).map((photo, i) => {
              const hasCaption = isMeaningfulTitle(photo.title);
              return (
                <Link
                  key={photo.id}
                  href="/gallery"
                  className={`gallery-item reveal ${i === 1 ? "reveal-delay-1" : i === 2 ? "reveal-delay-2" : ""}`}
                  style={{ minHeight: "200px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={hasCaption ? (photo.title as string) : "Campus Photo"}
                    loading="lazy"
                  />
                  {hasCaption && <h3>{photo.title}</h3>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
