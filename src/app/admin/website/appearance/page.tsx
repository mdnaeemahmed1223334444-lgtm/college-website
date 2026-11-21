import Link from "next/link";
import { getAppearanceSettings } from "@/features/website/queries";
import AppearanceForm from "@/components/admin/website/AppearanceForm";

export default async function WebsiteAppearancePage() {
  const appearance = await getAppearanceSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Colors & Appearance</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Website Colors & Styling</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize website colors, typography, and layout. (Intended for the website design team).
        </p>
      </div>

      <AppearanceForm initialData={appearance} />
    </div>
  );
}
