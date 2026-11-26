import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";

export const metadata = {
  title: "Examination Results | Student Portal",
  description: "View your published exam marks, subject grades, and GPA.",
};

export default async function StudentResultsPage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  let results: any[] = [];
  const supabase = privateAdmin();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("exam_results")
        .select("*")
        .eq("student_id", student.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        results = data;
      }
    } catch {
      // Table may not exist yet or empty
    }
  }

  // Group by exam_name
  const byExam = new Map<string, any[]>();
  for (const r of results) {
    const key = r.exam_name || "General Examination";
    if (!byExam.has(key)) byExam.set(key, []);
    byExam.get(key)!.push(r);
  }

  const gradeColor = (grade?: string) => {
    switch (grade) {
      case "A+":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "A":
        return "bg-green-100 text-green-800 border-green-300";
      case "A-":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "B":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "C":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "F":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Examination Results</h1>
          <p className="text-sm text-gray-500 mt-1">
            Official academic performance and published marks for <strong>{student.full_name}</strong> (ID:{" "}
            <span className="font-mono text-blue-700">{student.student_code}</span>)
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
        >
          ← Dashboard
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs">
          <p className="text-5xl mb-4">🏆</p>
          <h2 className="text-lg font-bold text-gray-900">No Published Results Found</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
            Your examination marks have not been published yet. Once the examination cell verifies and
            publishes the grades, they will appear here automatically.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-800">
            ℹ️ Inquiries regarding examination marks can be directed to the Academic Office.
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byExam.entries()).map(([examName, items]) => {
            const totalMarksSum = items.reduce((acc, curr) => acc + (Number(curr.total_marks) || 100), 0);
            const obtainedMarksSum = items.reduce((acc, curr) => acc + (Number(curr.obtained_marks) || 0), 0);
            const validGpaItems = items.filter((i) => i.gpa !== null && i.gpa !== undefined);
            const averageGpa =
              validGpaItems.length > 0
                ? (
                    validGpaItems.reduce((acc, curr) => acc + Number(curr.gpa), 0) / validGpaItems.length
                  ).toFixed(2)
                : null;

            return (
              <div
                key={examName}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs"
              >
                {/* Exam Title & Summary Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{examName}</h2>
                    <p className="text-xs text-blue-200 mt-0.5">
                      {student.batch_name} • {student.study_group?.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="bg-white/15 rounded-lg px-3 py-1.5 text-center">
                      <div className="text-[10px] uppercase opacity-75">Total Score</div>
                      <div className="text-sm font-black">
                        {obtainedMarksSum} / {totalMarksSum}
                      </div>
                    </div>
                    {averageGpa && (
                      <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center">
                        <div className="text-[10px] uppercase opacity-75">GPA</div>
                        <div className="text-sm font-black">{averageGpa}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3">Subject</th>
                        <th className="px-5 py-3">Total Marks</th>
                        <th className="px-5 py-3">Obtained Marks</th>
                        <th className="px-5 py-3">Grade</th>
                        <th className="px-5 py-3">GPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {items.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-3.5 font-bold text-gray-900">{row.subject}</td>
                          <td className="px-5 py-3.5 font-mono text-gray-500">{row.total_marks ?? 100}</td>
                          <td className="px-5 py-3.5 font-mono font-bold text-blue-700">
                            {row.obtained_marks ?? "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            {row.grade ? (
                              <span
                                className={`inline-flex items-center rounded-md border px-2 py-0.5 font-bold text-xs ${gradeColor(
                                  row.grade
                                )}`}
                              >
                                {row.grade}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-gray-800">
                            {row.gpa ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
