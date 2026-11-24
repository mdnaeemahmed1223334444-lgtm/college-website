"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { publicNav } from "@/config/navigation/public";
import { siteConfig } from "@/config/site";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavNode {
  title: string;
  href: string;
  hidden?: boolean;
  children?: NavNode[];
}

// ─── Desktop Dropdown Item ────────────────────────────────────────────────────
function DesktopNavItem({ item }: { item: NavNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        {item.title}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 min-w-[220px] rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm shadow-xl py-2 animate-fadeInUp"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {item.children?.map((child) => (
            <div key={child.href}>
              <Link
                href={child.href}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                {child.title}
              </Link>
              {child.children?.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className="flex items-center gap-2 py-2 pl-8 pr-4 text-xs text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-gray-400">↳</span>
                  {sub.title}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({
  nav,
  open,
  onClose,
}: {
  nav: NavNode[];
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-[82vw] max-w-sm bg-white shadow-2xl animate-slideInLeft overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-700 to-indigo-700">
          <Link href="/" onClick={onClose} className="text-white font-extrabold text-base tracking-tight">
            {siteConfig.name}
          </Link>
          <button
            onClick={onClose}
            className="rounded-full w-8 h-8 flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.filter((n) => !n.hidden).map((item) => (
            <div key={item.href} className="border-b border-gray-100 last:border-0">
              {item.children ? (
                <>
                  <button
                    onClick={() => setExpanded(expanded === item.href ? null : item.href)}
                    className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <span>{item.title}</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded === item.href ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expanded === item.href && (
                    <div className="bg-gray-50 py-1 animate-fadeInUp">
                      {item.children.map((child) => (
                        <div key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="block px-7 py-2.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            {child.title}
                          </Link>
                          {child.children?.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onClose}
                              className="block px-10 py-2 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              ↳ {sub.title}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block px-5 py-3.5 text-sm font-semibold text-gray-800 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer CTA */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          <Link
            href="/login"
            onClick={onClose}
            className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            🔐 Student / Staff Login
          </Link>
          <Link
            href="/admission/apply"
            onClick={onClose}
            className="block w-full rounded-xl border-2 border-blue-600 px-4 py-2.5 text-center text-sm font-bold text-blue-600 hover:bg-blue-50 transition"
          >
            Apply for Admission
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (publicNav as NavNode[]).filter((n) => !n.hidden);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200/70"
            : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-black text-white shadow">
              DMC
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-extrabold leading-tight text-gray-900 truncate max-w-[160px] sm:max-w-xs">
                {siteConfig.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 hidden sm:block leading-none">
                Excellence in Education
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {nav.map((item) => (
              <DesktopNavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/admission/apply"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:opacity-90 hover:scale-105 transition-all shadow"
            >
              Apply Now
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:border-blue-400 hover:text-blue-700 transition-all"
            >
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition gap-1.5"
            aria-label="Open menu"
          >
            <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
            <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
            <span className="w-4 h-0.5 bg-gray-700 rounded-full" />
          </button>
        </div>
      </header>

      <MobileDrawer nav={nav} open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
