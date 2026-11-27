"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@/types/navigation";

export default function PortalSidebar({ items }: { items: NavNode[] }) {
  const pathname = usePathname();

  // Determine initially expanded menus based on current pathname
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const matchesParent = pathname === item.href || pathname.startsWith(item.href + "/");
        const matchesChild = item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        );
        if (matchesParent || matchesChild) {
          initial[item.href] = true;
        }
      }
    }
    return initial;
  });

  // Keep open menus synced when user navigates
  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          const matches =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            item.children.some(
              (c) => pathname === c.href || pathname.startsWith(c.href + "/")
            );
          if (matches) {
            next[item.href] = true;
          }
        }
      }
      return next;
    });
  }, [pathname, items]);

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 bg-gray-50/80 p-3 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <ul className="space-y-1">
        {items.map((item, i) => {
          const hasChildren = Boolean(item.children && item.children.length > 0);
          const isExactActive = i === 0 ? pathname === item.href : pathname === item.href;
          const isChildActive = hasChildren && item.children!.some(
            (c) => pathname === c.href || pathname.startsWith(c.href + "/")
          );
          const isOpen = Boolean(openMenus[item.href]);

          return (
            <li key={item.href} className="space-y-0.5">
              <div className="flex items-center">
                <Link
                  href={item.href}
                  prefetch={false}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    isExactActive && !hasChildren
                      ? "bg-blue-600 text-white shadow-xs"
                      : isChildActive || isExactActive
                      ? "bg-blue-50 text-blue-800 font-extrabold"
                      : "text-gray-700 hover:bg-gray-200/70 hover:text-gray-900"
                  }`}
                >
                  {item.title}
                </Link>

                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMenu(item.href);
                    }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 ml-0.5 transition"
                    title={isOpen ? "Collapse submenu" : "Expand submenu"}
                    aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
                  >
                    <svg
                      className={`h-3.5 w-3.5 transform transition-transform duration-200 ${
                        isOpen ? "rotate-90" : "rotate-0"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sub-menu children */}
              {hasChildren && isOpen && (
                <ul className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-blue-200/70 ml-2 mt-0.5">
                  {item.children!.map((child) => {
                    const isChildCurrent =
                      pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          prefetch={false}
                          className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                            isChildCurrent
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900 font-medium"
                          }`}
                        >
                          {child.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
