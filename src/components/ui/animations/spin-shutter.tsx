"use client";

import React, { useState, useEffect, useRef } from "react";

export interface SpinShutterItem {
  id: string | number;
  url: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface SpinShutterProps {
  items?: SpinShutterItem[];
  speed?: number; // turns per minute
  radius?: number; // px radius
  tilt?: number; // deg tilt angle
  className?: string;
}

const DEFAULT_SHUTTER_PHOTOS: SpinShutterItem[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    title: "Campus Quadrangle",
    subtitle: "Main Building",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    title: "Student Leadership",
    subtitle: "Clubs & Societies",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    title: "Smart Classrooms",
    subtitle: "Interactive Learning",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80",
    title: "Science Laboratories",
    subtitle: "Hands-on Research",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80",
    title: "Sports & Athletics",
    subtitle: "Championship Spirit",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    title: "Central Library",
    subtitle: "Knowledge Resource",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    title: "Graduation Convocation",
    subtitle: "Honoring Excellence",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
    title: "Cultural Festival",
    subtitle: "Music & Theatre",
  },
];

export const SpinShutter: React.FC<SpinShutterProps> = ({
  items = DEFAULT_SHUTTER_PHOTOS,
  speed = 1.8,
  radius = 280,
  tilt = -12,
  className = "",
}) => {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeItem, setActiveItem] = useState<SpinShutterItem | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== null && !isPaused && speed > 0) {
        const delta = (time - lastTimeRef.current) / 1000;
        // 360 degrees in (60 / speed) seconds
        const degreesPerSec = (360 * speed) / 60;
        setRotation((prev) => (prev + degreesPerSec * delta) % 360);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused, speed]);

  const count = items.length;
  const angleStep = 360 / count;

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[540px] flex items-center justify-center overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setActiveItem(null);
      }}
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Revolving Shutter Ring */}
        <div
          className="relative w-0 h-0 transition-transform duration-75 ease-linear"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${tilt}deg) rotateY(${rotation}deg)`,
          }}
        >
          {items.map((item, idx) => {
            const angle = idx * angleStep;
            const isHovered = activeItem?.id === item.id;

            return (
              <div
                key={item.id}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `
                    rotateY(${angle}deg)
                    translateZ(${radius}px)
                    ${isHovered ? "scale(1.25) translateZ(40px)" : "scale(1)"}
                  `,
                  zIndex: isHovered ? 50 : 10,
                }}
                onMouseEnter={() => setActiveItem(item)}
              >
                {/* Photo Shutter Blade / Card */}
                <div
                  className="w-36 h-52 sm:w-44 sm:h-64 rounded-xl overflow-hidden border-2 border-white/30 backdrop-blur-md bg-[#101f32]/80 shadow-2xl transition-all duration-300 group hover:border-[#dfc89f] hover:shadow-[0_15px_40px_rgba(197,164,109,0.35)]"
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.url})` }}
                  />

                  {/* Gradient Card Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101f32] via-transparent to-black/20 p-3 flex flex-col justify-end text-left pointer-events-none">
                    {item.title && (
                      <h4 className="text-white text-xs sm:text-sm font-bold leading-tight drop-shadow-md">
                        {item.title}
                      </h4>
                    )}
                    {item.subtitle && (
                      <p className="text-[#dfc89f] text-[10px] font-medium tracking-wide mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Center Control Badge */}
      <div className="absolute bottom-6 z-20 flex items-center gap-3 px-4 py-2 rounded-full border border-white/20 bg-[#101f32]/70 backdrop-blur-md text-xs text-gray-300 shadow-xl pointer-events-auto">
        <span className="inline-block w-2 h-2 rounded-full bg-[#c5a46d] animate-pulse" />
        <span>{isPaused ? "Paused on Hover" : "Interactive 3D Shutter Orbit"}</span>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="ml-2 text-[11px] font-bold text-[#dfc89f] hover:text-white uppercase tracking-wider"
        >
          {isPaused ? "Resume ▶" : "Pause ⏸"}
        </button>
      </div>
    </div>
  );
};

export default SpinShutter;
