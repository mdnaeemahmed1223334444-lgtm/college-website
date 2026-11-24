"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
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

// ─── Default albums shown when DB is empty ───────────────────────────────────
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
];

const CATEGORIES = ["All", "Academic", "Sports", "Facilities", "Events", "Cultural"];

// ─── Lightbox ────────────────────────────────────────────────────────────────
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light transition z-10"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[current].url}
            alt={images[current].title}
            className="w-full max-h-[80vh] object-contain animate-fadeIn"
          />
          {images[current].title && (
            <div className="absolute bottom-0 left-0 right-0 glass-dark px-5 py-3">
              <p className="text-white text-sm font-medium">{images[current].title}</p>
              <p className="text-white/50 text-xs mt-0.5">{current + 1} / {images.length}</p>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-white/30 transition text-lg"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-white/30 transition text-lg"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Gallery Page ────────────────────────────────────────────────────────
export default function PublicGalleryPage() {
  const [albums] = useState<GalleryAlbum[]>(DEFAULT_ALBUMS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightbox, setLightbox] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });

  const filtered =
    activeCategory === "All"
      ? albums
      : albums.filter((a) => a.category === activeCategory);

  // Build flat image list for lightbox
  const lightboxImages = filtered.map((a) => ({ url: a.cover_image_url, title: a.title }));

  return (
    <div className="space-y-8">
      {/* Page header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 px-6 py-10 sm:px-10 sm:py-14 text-white shadow-xl animate-fadeInUp">
        {/* Deco orbs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-20 animate-floatY"
          style={{ background: "radial-gradient(circle, #f0abfc, transparent 70%)" }} />
        <div className="absolute -bottom-8 left-10 w-36 h-36 rounded-full opacity-15 animate-floatY delay-300"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)", animationDuration: "6s" }} />

        {/* Breadcrumb */}
        <nav className="relative flex items-center gap-2 text-xs text-white/60 mb-5">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-white font-semibold">Gallery</span>
        </nav>

        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Photo Gallery</h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
            Glimpses of campus life — science fairs, sports tournaments, laboratories, and annual celebrations.
          </p>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 animate-fadeInUp delay-100">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-100
              ${activeCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Album masonry grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center space-y-3 animate-fadeIn">
          <div className="text-5xl">🏫</div>
          <p className="text-sm font-semibold text-gray-700">No albums in this category yet</p>
          <p className="text-xs text-gray-400">Photos will appear here once added from the admin panel.</p>
        </div>
      ) : (
        <div className="photo-masonry animate-fadeInUp delay-200">
          {filtered.map((album, i) => (
            <div
              key={album.id}
              className="photo-masonry-item relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-scaleIn bg-gray-100"
              style={{ animationDelay: `${i * 70}ms` }}
              onClick={() => setLightbox({ open: true, idx: i })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.cover_image_url}
                alt={album.title}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/20 px-2 py-0.5 text-[10px] font-bold text-white uppercase w-fit mb-1.5">
                  {album.category}
                </span>
                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{album.title}</h3>
                {album.description && (
                  <p className="text-[11px] text-white/75 line-clamp-1 mt-0.5">{album.description}</p>
                )}
                <div className="mt-2 flex items-center gap-1 text-[10px] text-white/70">
                  <span>🔍 Click to enlarge</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add photos call-to-action for admins */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeInUp delay-400">
        <div>
          <h3 className="font-bold text-gray-800 text-sm">Want to add more photos?</h3>
          <p className="text-xs text-gray-500 mt-1">Admins can upload and manage photo albums from the admin panel.</p>
        </div>
        <Link
          href="/admin/content/gallery"
          className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition hover:scale-105 shadow"
        >
          Manage Gallery →
        </Link>
      </div>

      {/* Lightbox */}
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
