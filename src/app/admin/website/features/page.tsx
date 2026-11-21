import Link from "next/link";
import { getFeatureSettings } from "@/features/website/queries";
import FeaturesForm from "@/components/admin/website/FeaturesForm";

export default async function WebsiteFeaturesPage() {
  const features = await getFeatureSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Feature Switches</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Website Feature Switches</h1>
        <p className="text-sm text-gray-500 mt-1">
          Turn specific website capabilities and portals on or off with a single click.
        </p>
      </div>

      <FeaturesForm initialData={features} />
    </div>
  );
}
