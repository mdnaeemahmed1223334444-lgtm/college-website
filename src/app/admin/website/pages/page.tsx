import Link from "next/link";
import { getAllPages } from "@/features/website/queries";
import PagesManager from "@/components/admin/website/PagesManager";

export default async function PagesManagementPage() {
  const pages = await getAllPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Website Pages</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dynamic Website Pages</h1>
        <p className="text-sm text-gray-500">
          Create, edit, and publish rich content pages for About Us, Academic Regulations, Student Guidelines, and more.
        </p>
      </div>

      <PagesManager pages={pages} />
    </div>
  );
}
