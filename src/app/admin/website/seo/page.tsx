import Link from "next/link";
import { getSeoSettings } from "@/features/website/queries";
import SeoForm from "@/components/admin/website/SeoForm";

export default async function WebsiteSeoPage() {
  const seo = await getSeoSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Google & Search (SEO)</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Google & Search Engine Settings (SEO)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control how your website appears on Google search results and when links are shared on Facebook or WhatsApp.
        </p>
      </div>

      <SeoForm initialData={seo} />
    </div>
  );
}
