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

      <HomepageForm initialData={homepage} />
    </div>
  );
}
