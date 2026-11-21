import Link from "next/link";
import { getHolidays } from "@/features/content/queries";

export default async function PublicHolidaysPage() {
  const holidays = await getHolidays(2026);
  const totalOffDays = holidays.reduce((acc, h) => acc + h.total_days, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/information" className="hover:text-blue-600">Information</Link>
        <span>/</span>
        <span className="font-semibold text-gray-800">Academic Holidays</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Academic & National Holidays 2026</h1>
          <p className="mt-1 text-sm text-gray-500">
            Official annual holiday schedule approved by the College Academic Council and Education Board.
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-center sm:text-right shrink-0">
          <div className="text-xs font-semibold text-blue-900">Total Approved Holidays</div>
          <div className="text-2xl font-bold text-blue-700">{totalOffDays} Days</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="border-b bg-gray-50 text-[11px] font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-5 py-3.5">Occasion / Holiday</th>
              <th className="px-5 py-3.5">From</th>
              <th className="px-5 py-3.5">To</th>
              <th className="px-5 py-3.5">Total Days</th>
              <th className="px-5 py-3.5">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {holidays.map((h) => (
              <tr key={h.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="font-bold text-gray-900 text-sm">{h.title}</div>
                  {h.description && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{h.description}</div>
                  )}
                </td>
                <td className="px-5 py-4 font-mono text-gray-700">
                  {new Date(h.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-4 font-mono text-gray-700">
                  {new Date(h.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-4 font-bold text-gray-800">
                  {h.total_days} {h.total_days > 1 ? "days" : "day"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      h.type === "National"
                        ? "bg-red-50 text-red-700"
                        : h.type === "Religious"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {h.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
