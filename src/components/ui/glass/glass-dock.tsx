"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface DockItem {
  id: string;
  title: string;
  icon: React.ReactNode | string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

export interface GlassDockProps {
  items?: DockItem[];
  className?: string;
}

export const GlassDock: React.FC<GlassDockProps> = ({
  items = [
    { id: "home", title: "Home", icon: "🏛️", href: "/" },
    { id: "academic", title: "Academics", icon: "📚", href: "/academic/courses" },
    { id: "admission", title: "Admissions", icon: "🎓", href: "/admission/apply" },
    { id: "notices", title: "Notices", icon: "📋", href: "/notices" },
    { id: "gallery", title: "Gallery", icon: "🖼️", href: "/gallery" },
    { id: "login", title: "Portal", icon: "🔐", href: "/login" },
  ],
  className = "",
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Computes distance-based magnification scale for macOS dock fluid feel
  const getScale = (index: number) => {
    if (hoveredIdx === null) return 1;
    const distance = Math.abs(hoveredIdx - index);
    if (distance === 0) return 1.45;
    if (distance === 1) return 1.22;
    if (distance === 2) return 1.08;
    return 1;
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Dock Container with realistic Glass Effect */}
      <div
        className="relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-3.5
          rounded-2xl sm:rounded-3xl border border-white/30 backdrop-blur-2xl
          bg-white/[0.08] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_12px_40px_-6px_rgba(0,0,0,0.3)]
          transition-all duration-300 hover:border-white/50 hover:bg-white/[0.12]"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Top edge light reflection */}
        <span className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        {items.map((item, idx) => {
          const scale = getScale(idx);
          const isIconImage =
            typeof item.icon === "string" &&
            (item.icon.startsWith("http") || item.icon.startsWith("/"));

          const buttonContent = (
            <div
              className="relative flex flex-col items-center group transition-transform duration-200 ease-out origin-bottom"
              style={{
                transform: `scale(${scale})`,
                zIndex: hoveredIdx === idx ? 30 : 10,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
            >
              {/* Tooltip Label */}
              <div
                className={`absolute -top-9 px-2.5 py-1 rounded-md bg-[#101f32]/95 border border-[#c5a46d]/40
                  text-[11px] font-semibold text-white tracking-wide shadow-lg whitespace-nowrap pointer-events-none
                  transition-all duration-200 transform ${
                    hoveredIdx === idx
                      ? "opacity-100 -translate-y-1 scale-100"
                      : "opacity-0 translate-y-2 scale-90"
                  }`}
              >
                {item.title}
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#101f32] rotate-45 border-r border-b border-[#c5a46d]/40" />
              </div>

              {/* Icon Container with Glass Button Appearance */}
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl
                  flex items-center justify-center select-none cursor-pointer
                  border border-white/25 bg-white/10 backdrop-blur-md
                  shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_12px_rgba(0,0,0,0.15)]
                  transition-all duration-200 group-hover:border-[#c5a46d]/70 group-hover:bg-white/20"
              >
                {isIconImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.icon as string}
                    alt={item.title}
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl leading-none">
                    {item.icon}
                  </span>
                )}

                {/* Optional notification badge */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Active / Indicator Dot */}
              <span className="w-1 h-1 rounded-full bg-[#dfc89f] mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a46d] rounded-2xl"
                aria-label={item.title}
              >
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a46d] rounded-2xl"
              aria-label={item.title}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GlassDock;
