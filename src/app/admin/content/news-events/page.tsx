import Link from "next/link";
import { getNewsEvents } from "@/features/content/queries";
import { getBatches, getStudents } from "@/features/students/queries";
import NewsEventManager from "@/components/admin/content/NewsEventManager";

export default async function NewsEventsManagementPage() {
  const [items, batches, students] = await Promise.all([
    getNewsEvents(),
    getBatches(),
    getStudents(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">News & Events</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">News & Campus Events</h1>
        <p className="text-sm text-gray-500">
          Publish press releases, student achievements, seminar announcements, and sports schedules with instant email broadcast to campus.
        </p>
      </div>

      <NewsEventManager items={items} batches={batches} students={students} />
    </div>
  );
}
