import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";

export const metadata = {
  title: "Exam Schedule | Student Portal",
};

export default async function ExamSchedulePage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  let exams: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("exam_routines")
        .select("*")
        .eq("is_published", true)
        .or(`batch_id.is.null,batch_id.eq.${student.batch_id}`)
        .order("exam_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (data && data.length > 0) {
        exams = data.filter(
          (r: any) => !r.study_group || r.study_group === student.study_group
        );
      }
    } catch {
      // Table may not exist yet
    }
  }

  // Group by exam_name
  const byExam = new Map<string, any[]>();
  for (const r of exams) {
    const key = r.exam_name || "General";
    if (!byExam.has(key)) byExam.set(key, []);
    byExam.get(key)!.push(r);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Exam Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upcoming examinations for <strong>{student.batch_name}</strong>
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-bold text-gray-900">No Exam Schedule Published</p>
          <p className="text-sm text-gray-500 mt-2">
            Exam schedules will appear here once published by the administration.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(byExam.entries()).map(([examName, records]) => (
            <div key={examName} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="bg-indigo-700 px-5 py-3">
                <h2 className="text-sm font-bold text-white">{examName}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900 whitespace-nowrap">
                          {r.exam_date
                            ? new Date(r.exam_date).toLocaleDateString("en-GB", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.subject}</td>
                        <td className="px-4 py-3 font-mono text-gray-700 whitespace-nowrap">
                          {r.start_time?.slice(0, 5)} – {r.end_time?.slice(0, 5)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{r.room || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                          {r.instructions || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
