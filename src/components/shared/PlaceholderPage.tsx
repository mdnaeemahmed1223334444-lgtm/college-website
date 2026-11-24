import Link from "next/link";
import { findNode, findParent } from "@/config/navigation";

type Props = {
  href: string;
  /** Overrides (used by dynamic routes like /teacher/students/[studentId]) */
  title?: string;
  sections?: string[];
  backHref?: string;
  backLabel?: string;
};

/**
 * Temporary page body used by every route until its real feature is built.
 * Replace the <PlaceholderPage/> in a page.tsx with the real component when that part is done.
 */
export default function PlaceholderPage({ href, title, sections, backHref, backLabel }: Props) {
  const node = findNode(href);
  const parent = findParent(href);
  const back = backHref ? { href: backHref, title: backLabel ?? "Back" } : parent;
  const shownSections = sections ?? node?.sections;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
      {back && (
        <Link href={back.href} className="text-sm text-blue-700 hover:underline">
          &larr; {back.title}
        </Link>
      )}
      <h1 className="text-2xl font-bold">{title ?? node?.title ?? href}</h1>
      <p className="text-sm text-gray-500">
        Route: <code>{href}</code> &middot; Status: placeholder (not built yet)
      </p>

      {shownSections && (
        <div>
          <h2 className="mb-2 font-semibold">This page will contain</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {shownSections.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {node?.children && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {node.children.map((c) => (
            <Link key={c.href} href={c.href} className="rounded border p-4 hover:bg-gray-50">
              {c.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
