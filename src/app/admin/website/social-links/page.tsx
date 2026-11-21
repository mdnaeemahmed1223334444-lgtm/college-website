import Link from "next/link";
import { getSocialLinksSettings } from "@/features/website/queries";
import SocialLinksForm from "@/components/admin/website/SocialLinksForm";

export default async function SocialMediaLinksPage() {
  const links = await getSocialLinksSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Social Media & Helpline</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Official Social Media & WhatsApp Helpline</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your college&apos;s verified public pages (Facebook, YouTube, WhatsApp) to show as icons on the website.
        </p>
      </div>

      <SocialLinksForm initialData={links} />
    </div>
  );
}
