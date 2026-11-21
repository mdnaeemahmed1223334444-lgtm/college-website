import Link from "next/link";
import { getBrandingSettings } from "@/features/website/queries";
import BrandingForm from "@/components/admin/website/BrandingForm";

export default async function BrandingSettingsPage() {
  const branding = await getBrandingSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">College Name & Logo</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">College Name & Official Logo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set your official college name, Bengali title, motto, identification codes (EIIN), and crest/logo.
        </p>
      </div>

      <BrandingForm initialData={branding} />
    </div>
  );
}
