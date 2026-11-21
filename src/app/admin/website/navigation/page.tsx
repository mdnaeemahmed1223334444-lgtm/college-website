import Link from "next/link";
import { getNavigationItems } from "@/features/website/queries";
import NavigationManager from "@/components/admin/website/NavigationManager";

export default async function NavigationManagementPage() {
  const [headerItems, footerItems] = await Promise.all([
    getNavigationItems("header"),
    getNavigationItems("footer"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/website" className="hover:underline">Website Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Menu Links</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Website Menu Links</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add, edit, or remove the navigation links shown in the top header menu and the bottom footer.
        </p>
      </div>

      <NavigationManager headerItems={headerItems} footerItems={footerItems} />
    </div>
  );
}
