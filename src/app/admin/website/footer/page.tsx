import Link from "next/link";
import { getFooterSettings } from "@/features/website/queries";
import FooterForm from "@/components/admin/website/FooterForm";

export default async function WebsiteFooterPage() {
  const footer = await getFooterSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Footer & Contact Info</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Website Footer & Contact Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the physical campus address, office phone number, email, and bottom copyright note.
        </p>
      </div>

      <FooterForm initialData={footer} />
    </div>
  );
}
