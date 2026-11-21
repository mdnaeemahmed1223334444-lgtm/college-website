import Link from "next/link";
import { getHomepageSectionsSettings } from "@/features/website/queries";
import HomepageSectionsForm from "@/components/admin/website/HomepageSectionsForm";

export default async function HomepageSectionsPage() {
  const sections = await getHomepageSectionsSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Front Page Sections</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Front Page Layout & Sections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Turn content blocks ON or OFF to customize what appears on the front page.
        </p>
      </div>

      <HomepageSectionsForm initialData={sections} />
    </div>
  );
}
