import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getDocuments } from "@/features/content/queries";

export const metadata = {
  title: "Download Documents | Student Portal",
  description: "Download academic forms, syllabi, admission guidelines, and certificates.",
};

export default async function StudentDocumentsPage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const documents = await getDocuments({ activeOnly: true });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Download Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Official forms, syllabus files, and administrative document downloads.
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Student's Uploaded Document (if available) */}
      {student.document_url && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-indigo-200 text-indigo-900 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                Your Personal Document
              </span>
              <h3 className="text-base font-bold text-indigo-950 mt-1">
                {student.document_name || "Official Enrolled Student Document"}
              </h3>
              <p className="text-xs text-indigo-800 mt-0.5">
                Uploaded and verified by the College Administration Office.
              </p>
            </div>
            <a
              href={student.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-800 shadow-xs transition"
            >
              📥 Download
            </a>
          </div>
        </div>
      )}

      {/* General College Documents */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">College Documents &amp; Forms</h3>
          <span className="text-xs font-semibold text-gray-500">{documents.length} files available</span>
        </div>

        <div className="divide-y divide-gray-100">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              No general documents uploaded yet.
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50/60 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">📄</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{doc.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded font-medium">{doc.category}</span>
                      {doc.file_type && <span className="uppercase font-mono">{doc.file_type}</span>}
                      {doc.file_size && <span>• {doc.file_size}</span>}
                    </div>
                  </div>
                </div>

                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs self-start sm:self-center transition"
                >
                  Download File ↗
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
