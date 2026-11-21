import Link from "next/link";
import { getCareerCirculars } from "@/features/content/queries";
import CareerManager from "@/components/admin/content/CareerManager";

export default async function CareerCircularsManagementPage() {
  const circulars = await getCareerCirculars();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Career Circulars</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Career & Job Circulars</h1>
        <p className="text-sm text-gray-500">
          Post and manage academic faculty and administrative staff vacancies, qualifications, and deadlines.
        </p>
      </div>

      <CareerManager circulars={circulars} />
    </div>
  );
}
