"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  category: string;
  media_type: "photo" | "video";
  status: string;
}

const DEFAULT_ALBUMS: GalleryAlbum[] = [
  {
    id: "alb-1",
    title: "Campus Infrastructure & Facilities",
    slug: "campus-infrastructure-facilities",
    description: "A visual tour of our multimedia classrooms, science labs, central library, and green campus grounds.",
    cover_image_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    category: "Facilities",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-2",
    title: "Annual Athletics & Sports Competition",
    slug: "annual-athletics-sports-competition",
    description: "High-energy highlights from sprint races, high jump, cricket tournament, and prize giving ceremony.",
    cover_image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
    category: "Sports",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-3",
    title: "Science Fair & Innovation Showcase",
    slug: "science-fair-innovation-showcase",
    description: "Creative working models, environmental solutions, and robotics projects presented by young innovators.",
    cover_image_url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80",
    category: "Academic",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-4",
    title: "Cultural Festivals & International Mother Language Day",
    slug: "cultural-festivals-celebration",
    description: "Vibrant performances, music, drama, and art exhibitions celebrating national pride.",
    cover_image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    category: "Cultural",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-5",
    title: "Robotics Club & Computing Lab",
    slug: "robotics-computing-lab",
    description: "Hands-on coding, hardware prototyping, and digital literacy workshops.",
    cover_image_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    category: "Academic",
    media_type: "photo",
    status: "published",
  },
  {
    id: "alb-6",
    title: "Annual Prize Giving & Graduation Ceremony",
    slug: "prize-giving-graduation",
    description: "Honoring academic excellence, leadership awards, and meritorious students.",
    cover_image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    category: "Events",
    media_type: "photo",
    status: "published",
  },
];

const CATEGORIES = ["All", "Academic", "Sports", "Facilities", "Events", "Cultural"];

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: { url: string; title: string }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light transition z-10"
        >
          ✕
        </button>

        <div className="relative rounded-none overflow-hidden shadow-2xl bg-black border border-[#c5a46d]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current].url}
            alt={images[current].title}
            className="w-full max-h-[82vh] object-contain animate-fadeIn"
          />
          {images[current].title && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#101f32]/90 backdrop-blur-sm px-6 py-4 border-t border-[#c5a46d]/30">
              <p className="text-white text-sm font-medium font-serif">{images[current].title}</p>
              <p className="text-[#dfc89f] text-xs mt-0.5">{current + 1} of {images.length}</p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#101f32]/80 border border-[#c5a46d] text-[#c5a46d] hover:bg-[#c5a46d] hover:text-[#101f32] w-11 h-11 flex items-center justify-center transition text-xl"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#101f32]/80 border border-[#c5a46d] text-[#c5a46d] hover:bg-[#c5a46d] hover:text-[#101f32] w-11 h-11 flex items-center justify-center transition text-xl"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PublicGalleryPage() {
  const [albums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });

  const filtered =
    activeCategory === "All"
      ? albums
      : albums.filter((a) => a.category === activeCategory);

  const lightboxImages = filtered.map((a) => ({ url: a.cover_image_url, title: a.title }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#101f32] p-8 sm:p-12 text-white relative overflow-hidden border border-[#c5a46d]/30 shadow-xl reveal">
        <div className="relative z-10">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-[#dfc89f] font-semibold">Campus Gallery</span>
          </nav>

          <span className="eyebrow text-[#dfc89f]">Visual Archive</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white mb-3">
            Campus Photo &amp; Media Gallery
          </h1>
          <p className="text-[#aeb8c4] text-sm sm:text-base max-w-2xl leading-relaxed">
            Capturing the spirit of Dhaka Model College — science exhibitions, athletic tournaments,
            smart classrooms, cultural events, and milestone celebrations.
          </p>
          <div className="gold-line" />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 reveal">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeCategory === cat
                ? "bg-[#c5a46d] text-[#101f32] shadow-md"
                : "bg-white border border-[#e9e5dc] text-[#283444] hover:border-[#c5a46d] hover:text-[#c5a46d]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((album, i) => (
          <div
            key={album.id}
            onClick={() => setLightbox({ open: true, idx: i })}
            className={`gallery-item reveal cursor-pointer group bg-black shadow-md hover:shadow-2xl transition-all duration-300 ${
              i % 3 === 1 ? "reveal-delay-1" : i % 3 === 2 ? "reveal-delay-2" : ""
            }`}
            style={{ minHeight: "260px" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.cover_image_url}
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-[#101f32]/85 text-[#dfc89f] border border-[#c5a46d]/40 text-[9px] font-bold px-2.5 py-1 uppercase tracking-wider">
                {album.category}
              </span>
            </div>
            <h3>{album.title}</h3>
          </div>
        ))}
      </div>

      {/* Admin Notice */}
      <div className="bg-white border border-[#e9e5dc] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 reveal">
        <div>
          <h3 className="font-serif text-lg font-semibold text-[#101f32]">
            Want to add photos to this gallery?
          </h3>
          <p className="text-xs text-[#7b8490] mt-1">
            College administrators can upload new albums, photos, and event highlights directly from
            the admin portal.
          </p>
        </div>
        <Link href="/admin/content/gallery" className="btn btn-primary flex-shrink-0">
          MANAGE GALLERY ↗
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightbox.open && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightbox.idx}
          onClose={() => setLightbox({ open: false, idx: 0 })}
        />
      )}
    </div>
  );
}
