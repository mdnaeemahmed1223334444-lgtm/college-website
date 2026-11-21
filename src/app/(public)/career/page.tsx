import Link from "next/link";
import { getCareerCirculars } from "@/features/content/queries";

export default async function PublicCareerPage() {
  const circulars = await getCareerCirculars();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Careers & Vacancies</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Career Opportunities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join our dedicated academic faculty and administrative team in shaping tomorrow&apos;s leaders.
          </p>
        </div>
        <div className="rounded bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
          {circulars.length} Open Job Postings
        </div>
      </div>

      <div className="space-y-4">
        {circulars.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center text-gray-400">
            No vacancies currently open. Please check back later.
          </div>
        ) : (
          circulars.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3">
                <div>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                    {c.employment_type}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{c.title}</h2>
                  <div className="text-xs text-gray-500">
                    Position: <strong>{c.post_name}</strong> &bull; Vacancy: <strong>{c.vacancy}</strong>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-semibold text-red-600">
                    Deadline: {new Date(c.deadline).toLocaleDateString()}
                  </div>
                  {c.circular_file_url && (
                    <a
                      href={c.circular_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      <span>📥</span> Official Circular PDF
                    </a>
                  )}
                </div>
              </div>

              {c.requirements && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Requirements</h3>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {c.requirements}
                  </p>
                </div>
              )}

              {c.application_instructions && (
                <div className="rounded-lg bg-gray-50 p-4 border text-xs text-gray-700">
                  <span className="font-bold text-gray-900">How to Apply: </span>
                  {c.application_instructions}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
