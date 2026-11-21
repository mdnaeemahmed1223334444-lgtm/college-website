"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavNode } from "@/types/navigation";

export default function PortalSidebar({ items }: { items: NavNode[] }) {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 border-r bg-gray-50 p-3">
      <ul className="space-y-1">
        {items.map((item, i) => {
          // first item is the dashboard (the area root): match exactly
          const active = i === 0 ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded px-3 py-2 text-sm ${active ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
