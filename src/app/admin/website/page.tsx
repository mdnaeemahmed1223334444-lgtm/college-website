import Link from "next/link";
import {
  getBrandingSettings,
  getFeatureSettings,
  getAllPages,
  getNavigationItems,
} from "@/features/website/queries";

export default async function WebsiteManagementOverviewPage() {
  const [branding, features, pages, navItems] = await Promise.all([
    getBrandingSettings(),
    getFeatureSettings(),
    getAllPages(),
    getNavigationItems("header"),
  ]);

  const frequentModules = [
    {
      title: "Front Page Welcome & Announcements",
      href: "/admin/website/homepage",
      desc: "Change the big welcome headline, button links, banner photo, and the top scrolling news ticker.",
      icon: "📢",
      tag: "Frequent",
      tagColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "Website Pages & Articles",
      href: "/admin/website/pages",
      desc: `Create or edit information pages (${pages.length} pages currently published).`,
      icon: "📄",
      tag: "Frequent",
      tagColor: "bg-blue-100 text-blue-800",
    },
    {
      title: "Social Media & WhatsApp Helpline",
      href: "/admin/website/social-links",
      desc: "Update your official Facebook page, YouTube channel, and WhatsApp contact number.",
      icon: "🌐",
      tag: "Frequent",
      tagColor: "bg-blue-100 text-blue-800",
    },
  ];

  const collegeInfoModules = [
    {
      title: "College Name & Official Logo",
      href: "/admin/website/branding",
      desc: `College name (${branding.collegeName}), EIIN (${branding.eiin || "N/A"}), board code, and crest image.`,
      icon: "🏛️",
      tag: "Setup Once",
      tagColor: "bg-gray-100 text-gray-700",
    },
    {
      title: "Top Menu & Footer Links",
      href: "/admin/website/navigation",
      desc: `Manage the menu links shown at the top and bottom of the website (${navItems.length} links configured).`,
      icon: "🧭",
      tag: "Rarely Changed",
      tagColor: "bg-gray-100 text-gray-700",
    },
    {
      title: "Front Page Layout / Sections",
      href: "/admin/website/homepage-sections",
      desc: "Turn sections ON or OFF (e.g. Principal's Message, College Numbers, Photo Gallery).",
      icon: "🧩",
      tag: "Rarely Changed",
      tagColor: "bg-gray-100 text-gray-700",
    },
    {
      title: "Footer & Campus Contact Info",
      href: "/admin/website/footer",
      desc: "Campus physical address, office telephone, email, and copyright text at page bottom.",
      icon: "📞",
      tag: "Rarely Changed",
      tagColor: "bg-gray-100 text-gray-700",
    },
    {
      title: "Turn Features ON or OFF",
      href: "/admin/website/features",
      desc: "Enable or disable student portals, online admission form, and exam results publishing.",
      icon: "⚙️",
      tag: "Settings",
      tagColor: "bg-gray-100 text-gray-700",
    },
  ];

  const technicalModules = [
    {
      title: "Website Colors & Styling",
      href: "/admin/website/appearance",
      desc: "Theme colors, font styles, and sticky header. For design team use.",
      icon: "🎨",
      tag: "Design Team",
      tagColor: "bg-amber-100 text-amber-800",
    },
    {
      title: "Google Search (SEO) Settings",
      href: "/admin/website/seo",
      desc: "Website title in Google search results, search keywords, and Facebook share image.",
      icon: "🔍",
      tag: "Technical",
      tagColor: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Website Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Easily update what visitors see on your college website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <span>Preview Live Website</span>
            <span className="text-gray-400">↗</span>
          </Link>
        </div>
      </div>

      {/* Helpful Quick Guide */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">Looking to update daily college content?</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              To publish daily notices, exam results, or photo gallery albums, jump directly to the active content areas:
            </p>
            <div className="flex flex-wrap gap-2 mt-2.5">
              <Link
                href="/admin/content/notices"
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              >
                📌 Publish Notice / Circular
              </Link>
              <Link
                href="/admin/content/news"
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              >
                📰 Post News & Events
              </Link>
              <Link
                href="/admin/content/gallery"
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              >
                🖼️ Upload Gallery Photos
              </Link>
              <Link
                href="/admin/content/documents"
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              >
                📄 Upload Forms & Syllabuses
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* College Status Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">College Name</div>
          <div className="mt-1 text-sm font-bold text-gray-900 truncate">{branding.collegeName}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">EIIN: {branding.eiin || "Not set"}</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Custom Pages</div>
          <div className="mt-1 text-xl font-bold text-blue-600">{pages.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Live content pages</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Menu Links</div>
          <div className="mt-1 text-xl font-bold text-emerald-600">{navItems.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">In top navigation</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-gray-500">Online Admission</div>
          <div className="mt-1 text-sm font-bold">
            {features.onlineAdmission ? (
              <span className="text-emerald-600">● Open for Applicants</span>
            ) : (
              <span className="text-gray-400">○ Closed</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Public application form</div>
        </div>
      </div>

      {/* Group 1: Frequent Updates */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📢</span>
          <h2 className="text-base font-bold text-gray-900">Front Page & Daily Announcements</h2>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
            Most Often Updated
          </span>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Use these to update welcome text, headline banners, and contact links that change regularly.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {frequentModules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col justify-between rounded-lg border border-blue-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.tagColor}`}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-blue-600">{m.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{m.desc}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
                Open Settings &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Group 2: College Information & Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <h2 className="text-base font-bold text-gray-900">College Identity & Structure</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
            Set Once / Rarely Changed
          </span>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Official details like college name, logo, menu links, address, and feature toggles.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collegeInfoModules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.tagColor}`}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-blue-600">{m.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{m.desc}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
                Open Settings &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Group 3: Design & Advanced */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎨</span>
          <h2 className="text-base font-bold text-gray-900">Styling & Search Engine (Design Team)</h2>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Advanced / Seldom Touched
          </span>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Website theme colors and Google search optimization. You rarely need to touch these.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {technicalModules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.tagColor}`}>
                    {m.tag}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-blue-600">{m.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{m.desc}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:underline">
                Open Settings &rarr;
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
