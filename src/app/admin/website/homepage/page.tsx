import Link from "next/link";
import { getHomepageSettings } from "@/features/website/queries";
import HomepageForm from "@/components/admin/website/HomepageForm";

export default async function ManageHomepagePage() {
  const homepage = await getHomepageSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Front Page Banner & Ticker</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Front Page Welcome Banner & Ticker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the main banner headline, welcome description, buttons, and the scrolling announcement strip at the top.
        </p>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="text-sm font-semibold text-indigo-950">
              Interactive ScrollExpand Opening Hero
            </h3>
            <p className="text-xs text-indigo-700 mt-0.5">
              Looking to customize the cinematic full-screen opening animation that visitors see when first loading the website?
            </p>
          </div>
        </div>
        <Link
          href="/admin/website/scroll-expand-hero"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <span>Open Hero Settings</span>
          <span>&rarr;</span>
        </Link>
      </div>

      <HomepageForm initialData={homepage} />
    </div>
  );
}
