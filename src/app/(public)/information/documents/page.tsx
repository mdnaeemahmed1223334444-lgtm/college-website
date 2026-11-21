import Link from "next/link";
import { getDocuments } from "@/features/content/queries";

export default async function PublicDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const documents = await getDocuments({
    category: category || "all",
    activeOnly: true,
  });

  const categories = ["all", "Admission", "Syllabus", "General Forms", "Policies"];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/information" className="hover:text-blue-600">Information</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Important Documents</span>
      </nav>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Downloadable Documents & Forms</h1>
        <p className="mt-1 text-sm text-gray-500">
          Official syllabus guides, admission prospectuses, leave forms, and institutional conduct handbooks.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const isActive = (!category && c === "all") || category?.toLowerCase() === c.toLowerCase();
          return (
            <Link
              key={c}
              href={c === "all" ? "/information/documents" : `/information/documents?category=${c}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>

      {/* Documents Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3.5">Document Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Format & Size</th>
              <th className="px-5 py-3.5 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  No documents found in this section.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700">
                        {doc.file_type}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">{doc.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-gray-500">
                    {doc.file_type} {doc.file_size ? `&bull; ${doc.file_size}` : ""}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
                    >
                      <span>📥</span> Download
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
