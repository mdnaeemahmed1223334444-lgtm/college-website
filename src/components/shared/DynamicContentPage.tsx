import Link from "next/link";
import { getPageBySlug } from "@/features/website/queries";
import { publicNav } from "@/config/navigation/public";

interface Props {
  slug: string;
  fallbackTitle: string;
  fallbackContent?: string;
  category?: "about" | "academic" | "information";
}

export default async function DynamicContentPage({
  slug,
  fallbackTitle,
  fallbackContent,
  category = "about",
}: Props) {
  const page = await getPageBySlug(slug);

  const title = page?.title || fallbackTitle;
  const content = page?.content || fallbackContent || "<p>Content is being updated. Please check back shortly.</p>";

  // Find sidebar sister links
  const parentNode = publicNav.find((n) => n.href.includes(category));
  const sublinks = parentNode?.children || [];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href={`/${category}`} className="capitalize hover:text-blue-600">
          {category}
        </Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">{title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
              {page?.updated_at && (
                <p className="mt-1 text-xs text-gray-400">
                  Last updated: {new Date(page.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <Link
              href="/admin/website/pages"
              className="inline-flex items-center text-xs text-gray-400 hover:text-blue-600"
            >
              ✎ Edit in Admin
            </Link>
          </div>

          <article
            className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Sidebar Sublinks */}
        <aside className="space-y-6">
          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              In this section
            </h3>
            <ul className="space-y-1.5 text-xs">
              {sublinks.map((link) => {
                const isActive = link.href.endsWith(slug) || link.href === `/${slug}`;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded px-2.5 py-1.5 font-medium transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Help Card */}
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 space-y-2">
            <h4 className="text-xs font-bold text-blue-900">Need Assistance?</h4>
            <p className="text-xs text-blue-800">
              Contact our college administration office during working hours (8:00 AM - 3:00 PM).
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-block rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Contact Office
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
