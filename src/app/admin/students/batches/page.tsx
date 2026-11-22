import Link from "next/link";
import { getBatches } from "@/features/students/queries";
import BatchManager from "@/components/admin/students/BatchManager";

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/students" className="hover:underline">
          Student Management
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Batches</span>
      </div>

      <BatchManager initialBatches={batches} />
    </div>
  );
}
