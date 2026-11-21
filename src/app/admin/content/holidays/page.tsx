import Link from "next/link";
import { getHolidays } from "@/features/content/queries";
import HolidayManager from "@/components/admin/content/HolidayManager";

export default async function HolidaysManagementPage() {
  const holidays = await getHolidays(2026);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Holiday Management</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic & National Holidays</h1>
        <p className="text-sm text-gray-500">
          Maintain the annual calendar of college closures, examinations breaks, and public holiday leaves.
        </p>
      </div>

      <HolidayManager holidays={holidays} />
    </div>
  );
}
