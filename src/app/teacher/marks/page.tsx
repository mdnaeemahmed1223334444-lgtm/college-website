import { privateAdmin } from "@/lib/supabase/private-server";
import ExamResultsManager from "@/components/admin/students/ExamResultsManager";

export const metadata = {
  title: "Student Marks Entry | Teacher Portal",
};

export default async function TeacherMarksPage() {
  const supabase = privateAdmin();
  let results: any[] = [];
  let students: any[] = [];

  if (supabase) {
    try {
      const [resRes, studRes, batchRes] = await Promise.all([
        supabase
          .from("exam_results")
          .select("*, students:student_id(id, full_name, student_code, batch_id, study_group)")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("id, full_name, student_code, batch_id, study_group")
          .eq("status", "active")
          .order("full_name"),
        supabase
          .from("batches")
          .select("id, name"),
      ]);

      results = resRes.data || [];

      const batchMap = new Map((batchRes.data || []).map((b: any) => [b.id, b.name]));
      students = (studRes.data || []).map((s: any) => ({
        ...s,
        batch_name: batchMap.get(s.batch_id) || "",
      }));
    } catch {
      // Tables may not exist yet
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Marks & Results Entry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record, update, and submit student examination scores and subject grades. Published marks will immediately appear on individual student profiles.
        </p>
      </div>

      <ExamResultsManager initialResults={results} students={students} />
    </div>
  );
}
