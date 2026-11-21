import Link from "next/link";
import type { NavNode } from "@/types/navigation";
import { logoutAction } from "@/features/auth/actions";
import PortalSidebar from "./PortalSidebar";

/** Shared frame for Student / Teacher / Admin areas. */
export default function PortalShell({
  title,
  nav,
  userName,
  children,
}: {
  title: string;
  nav: NavNode[];
  userName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <span className="font-bold">{title}</span>
        <div className="flex items-center gap-4 text-sm">
          {userName && <span className="text-gray-600">{userName}</span>}
          <Link href="/" className="text-blue-700 hover:underline">View website</Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded border px-3 py-1 hover:bg-gray-100">Logout</button>
          </form>
        </div>
      </header>
      <div className="flex flex-1">
        <PortalSidebar items={nav} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
