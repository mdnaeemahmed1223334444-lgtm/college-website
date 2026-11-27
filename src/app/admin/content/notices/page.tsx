import Link from "next/link";
import { getNotices } from "@/features/content/queries";
import { getBatches } from "@/features/students/queries";
import NoticeManager from "@/components/admin/content/NoticeManager";

export default async function NoticeManagementPage() {
  const [notices, batches] = await Promise.all([
    getNotices({ status: "all", includeExpired: true }),
    getBatches(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Notices</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notices Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Publish notices with plain text, PDF downloads, picture announcements, or Word documents. You can also set automatic expiration deadlines and broadcast email notifications.
        </p>
      </div>

      <NoticeManager notices={notices} batches={batches} />
    </div>
  );
}
