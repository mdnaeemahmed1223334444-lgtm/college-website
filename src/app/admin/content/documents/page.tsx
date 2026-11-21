import Link from "next/link";
import { getDocuments } from "@/features/content/queries";
import DocumentManager from "@/components/admin/content/DocumentManager";

export default async function DocumentsManagementPage() {
  const documents = await getDocuments({ activeOnly: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/content" className="hover:underline">Content Management</Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">Document Management</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Downloadable Documents & Forms</h1>
        <p className="text-sm text-gray-500">
          Upload syllabi, student forms, handbooks, and policy PDFs for public and student download.
        </p>
      </div>

      <DocumentManager documents={documents} />
    </div>
  );
}
