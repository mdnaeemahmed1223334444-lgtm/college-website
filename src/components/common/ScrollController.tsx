"use client";

import { useEffect } from "react";

export default function ScrollController() {
  useEffect(() => {
    // 1. Scroll Progress & Sticky Header
    const progressBar = document.getElementById("scrollProgress");
    const header = document.querySelector("header.site-header");
    const backTop = document.getElementById("backTop");

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = progress + "%";
      }

      if (header) {
        if (window.scrollY > 60) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      if (backTop) {
        if (window.scrollY > 400) {
          backTop.classList.add("visible");
        } else {
          backTop.classList.remove("visible");
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 2. Scroll Reveal IntersectionObserver
    const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // 3. Touch Ripple for Buttons
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = (event.target as HTMLElement)?.closest(".btn, .nav-apply") as HTMLElement | null;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

      const ripple = document.createElement("span");
      ripple.className = "touch-ripple";
      ripple.style.left = clientX - rect.left + "px";
      ripple.style.top = clientY - rect.top + "px";

      target.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 650);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      revealObserver.disconnect();
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return <div className="scroll-progress" id="scrollProgress" aria-hidden="true" />;
}
