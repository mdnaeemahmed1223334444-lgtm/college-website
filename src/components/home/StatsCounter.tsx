"use client";

import { useEffect, useRef } from "react";

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  delayClass: string;
}

const STATS: StatItem[] = [
  { target: 28, suffix: "+", label: "Years of Excellence", delayClass: "" },
  { target: 3000, suffix: "+", label: "Enrolled Students", delayClass: "reveal-delay-1" },
  { target: 120, suffix: "+", label: "Faculty Members", delayClass: "reveal-delay-2" },
  { target: 98, suffix: "%", label: "Board Success Rate", delayClass: "reveal-delay-3" },
];

export default function StatsCounter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const statElements = el.querySelectorAll<HTMLElement>("[data-target]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const targetEl = entry.target as HTMLElement;
          const target = Number(targetEl.dataset.target);
          const suffix = targetEl.dataset.suffix || "";
          const duration = 1600;
          const startTime = performance.now();

          function updateNumber(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smooth quartic easing out
            const eased = 1 - Math.pow(1 - progress, 4);
            const currentVal = Math.floor(target * eased);

            targetEl.textContent = currentVal.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateNumber);
            }
          }

          requestAnimationFrame(updateNumber);
          observer.unobserve(targetEl);
        });
      },
      { threshold: 0.3 }
    );

    statElements.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className={`stat reveal ${stat.delayClass}`}>
            <strong data-target={stat.target} data-suffix={stat.suffix}>
              0
            </strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
