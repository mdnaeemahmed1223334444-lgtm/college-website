import Link from "next/link";
import { publicNav } from "@/config/navigation/public";
import { siteConfig } from "@/config/site";
import { getBrandingSettings } from "@/features/website/queries";

export default async function PublicHeader() {
  const branding = await getBrandingSettings();
  const collegeName = branding.collegeName || siteConfig.name;
  const shortName = branding.shortName || "DMC";

  return (
    <header className="border-b bg-white sticky top-0 z-30 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={collegeName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-xs font-bold text-white">
              {shortName.slice(0, 3)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-gray-900">{collegeName}</span>
            {branding.motto && (
              <span className="text-[10px] text-gray-500 hidden sm:inline">{branding.motto}</span>
            )}
          </div>
        </Link>

        <nav className="flex items-center">
          {publicNav.filter((n) => !n.hidden).map((item) => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded">
                {item.title}
              </Link>

              {item.children && (
                <div className="invisible absolute left-0 top-full z-20 min-w-60 rounded-md border border-gray-100 bg-white py-2 shadow-lg group-hover:visible transition-all">
                  {item.children.map((child) => (
                    <div key={child.href}>
                      <Link href={child.href} className="block px-4 py-2 text-sm font-medium text-gray-800 hover:bg-blue-50 hover:text-blue-700">
                        {child.title}
                      </Link>
                      {child.children?.map((sub) => (
                        <Link key={sub.href} href={sub.href} className="block py-1 pl-8 pr-4 text-xs text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
