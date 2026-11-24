"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { publicNav } from "@/config/navigation/public";

interface NavNode {
  title: string;
  href: string;
  hidden?: boolean;
  children?: NavNode[];
}

export default function PublicHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const nav = (publicNav as NavNode[]).filter((n) => !n.hidden);

  return (
    <>
      {/* ─── TOP BAR ─── */}
      <div className="topbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="font-medium text-xs">Welcome to Dhaka Model College</span>
          <span className="text-[#c5a46d] font-semibold tracking-wide text-xs">
            Excellence • Integrity • Innovation
          </span>
        </div>
      </div>

      {/* ─── MAIN HEADER ─── */}
      <header
        className={`site-header ${
          !isHome ? "!sticky !top-0 !bg-[#101f32] shadow-lg border-b border-[#c5a46d]/20" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo with rotating gold symbol */}
          <Link href="/" className="logo flex items-center gap-3 text-white group">
            <div className="logo-symbol">
              <span>D</span>
            </div>
            <div className="logo-text">
              <strong className="font-serif text-xl sm:text-2xl font-medium tracking-tight block text-white">
                Dhaka Model
              </strong>
              <small className="text-[#dfc89f] text-[9px] tracking-[2px] uppercase block font-semibold">
                College &amp; Institution
              </small>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {nav.map((item) => (
              <div key={item.href} className="relative group">
                <Link href={item.href} className="nav-link-item block py-2">
                  {item.title}
                </Link>

                {item.children && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full pt-2 transition-all duration-300 z-50">
                    <div className="min-w-[230px] bg-[#101f32]/95 backdrop-blur-md border border-[#c5a46d]/30 shadow-2xl py-2">
                      {item.children.map((child) => (
                        <div key={child.href}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2 text-xs font-semibold text-gray-200 hover:text-[#dfc89f] hover:bg-white/5 transition-colors"
                          >
                            {child.title}
                          </Link>
                          {child.children?.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="block py-1 pl-7 pr-4 text-[11px] text-gray-400 hover:text-white transition-colors"
                            >
                              ↳ {sub.title}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link href="/admission/apply" className="nav-apply">
              ADMISSIONS ↗
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white text-2xl p-2 focus:outline-none transition-transform active:scale-90"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#101f32] border-t border-[#c5a46d]/20 px-4 py-5 shadow-2xl animate-fadeIn">
            <div className="flex flex-col space-y-1">
              {nav.map((item) => (
                <div key={item.href} className="border-b border-white/5 pb-1">
                  {item.children ? (
                    <div>
                      <button
                        onClick={() =>
                          setExpandedMenu(expandedMenu === item.href ? null : item.href)
                        }
                        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-white hover:text-[#dfc89f]"
                      >
                        <span>{item.title}</span>
                        <span className="text-xs text-[#c5a46d]">
                          {expandedMenu === item.href ? "−" : "+"}
                        </span>
                      </button>

                      {expandedMenu === item.href && (
                        <div className="pl-4 pb-2 space-y-1 bg-black/20 pt-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 text-xs text-gray-300 hover:text-white"
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 text-sm font-semibold text-white hover:text-[#dfc89f]"
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/admission/apply"
                  onClick={() => setMobileOpen(false)}
                  className="nav-apply text-center py-3 w-full"
                >
                  ADMISSIONS ↗
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline text-center py-2.5 text-xs text-white"
                >
                  PORTAL LOGIN
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
