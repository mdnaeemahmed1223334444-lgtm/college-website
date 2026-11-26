import Link from "next/link";
import { getScrollExpandHeroSettings } from "@/features/website/queries";
import ScrollExpandHeroForm from "@/components/admin/website/ScrollExpandHeroForm";

export const metadata = {
  title: "ScrollExpand Hero Experience | Admin Portal",
  description: "Configure the smooth scroll-driven full-screen hero opening animation for the college homepage.",
};

export default async function ManageScrollExpandHeroPage() {
  const settings = await getScrollExpandHeroSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">ScrollExpand Opening Hero</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            ScrollExpand Opening Hero Experience
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Configure the smooth scroll-driven opening animation for visitors. As visitors scroll down, the college photograph expands from a centered cinematic frame to full screen, smoothly transitioning into your homepage sections.
          </p>
        </div>
        <div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span>Preview Live Hero</span>
            <span className="text-gray-400">↗</span>
          </Link>
        </div>
      </div>

      <ScrollExpandHeroForm initialData={settings} />
    </div>
  );
}
