"use client";

import { useState, useEffect } from "react";
import { isMeaningfulTitle } from "@/features/content/types";

interface PhotoItem {
  id: string;
  url: string;
  title: string | null;
}

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: PhotoItem[];
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

  const activePhoto = images[current];
  const hasTitle = activePhoto && isMeaningfulTitle(activePhoto.title);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close photo preview"
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light transition z-10 cursor-pointer"
        >
          ✕
        </button>

        <div className="relative overflow-hidden shadow-2xl bg-black border border-[#c5a46d]/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.url}
            alt={hasTitle ? (activePhoto.title as string) : "Campus gallery photo"}
            className="w-full max-h-[82vh] object-contain animate-fadeIn"
          />
          {hasTitle && (
            <div className="absolute bottom-0 left-0 right-0 bg-[#101f32]/90 backdrop-blur-sm px-6 py-4 border-t border-[#c5a46d]/30">
              <p className="text-white text-sm font-medium font-serif">{activePhoto.title}</p>
              <p className="text-[#dfc89f] text-xs mt-0.5">
                {current + 1} of {images.length}
              </p>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#101f32]/80 border border-[#c5a46d] text-[#c5a46d] hover:bg-[#c5a46d] hover:text-[#101f32] w-11 h-11 flex items-center justify-center transition text-xl cursor-pointer"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#101f32]/80 border border-[#c5a46d] text-[#c5a46d] hover:bg-[#c5a46d] hover:text-[#101f32] w-11 h-11 flex items-center justify-center transition text-xl cursor-pointer"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PublicGalleryViewer({ initialPhotos }: { initialPhotos: PhotoItem[] }) {
  const [lightbox, setLightbox] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });

  if (initialPhotos.length === 0) {
    return (
      <div className="rounded-xl border border-[#e9e5dc] bg-white p-16 text-center shadow-xs space-y-3">
        <span className="text-4xl block">🖼️</span>
        <h3 className="font-serif text-lg font-semibold text-[#101f32]">No Photos in Gallery Yet</h3>
        <p className="text-xs text-[#7b8490] max-w-md mx-auto">
          Our photo gallery is currently being updated. Please check back soon for campus highlights and event moments.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Unified Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPhotos.map((photo, i) => {
          const hasTitle = isMeaningfulTitle(photo.title);

          return (
            <div
              key={photo.id}
              onClick={() => setLightbox({ open: true, idx: i })}
              className={`gallery-item reveal cursor-pointer group bg-black shadow-md hover:shadow-2xl transition-all duration-300 ${
                i % 3 === 1 ? "reveal-delay-1" : i % 3 === 2 ? "reveal-delay-2" : ""
              }`}
              style={{ minHeight: "260px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={hasTitle ? (photo.title as string) : "Campus Photo"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                loading="lazy"
              />
              {/* Only show caption if admin explicitly provided a real title */}
              {hasTitle && <h3>{photo.title}</h3>}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {lightbox.open && initialPhotos.length > 0 && (
        <Lightbox
          images={initialPhotos}
          startIndex={lightbox.idx}
          onClose={() => setLightbox({ open: false, idx: 0 })}
        />
      )}
    </div>
  );
}
