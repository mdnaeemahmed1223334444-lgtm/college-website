import { privateAdmin } from "@/lib/supabase/private-server";
import ExamResultsManager from "@/components/admin/students/ExamResultsManager";

export const metadata = {
  title: "Marks Management | Admin",
};

export default async function MarksManagementPage() {
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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Marks & Exam Results Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add, edit, and publish exam results for individual students. Results are only visible to students after publishing.
        </p>
      </div>

      {/* SQL hint */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 space-y-1">
        <p className="font-bold">ℹ️ First-time setup: Run this SQL in Supabase if the table does not exist yet:</p>
        <pre className="bg-white/60 rounded p-2 mt-1 font-mono text-[11px] overflow-x-auto">{`CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id TEXT,
  exam_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  total_marks NUMERIC DEFAULT 100,
  obtained_marks NUMERIC,
  grade TEXT,
  gpa NUMERIC,
  exam_date DATE,
  academic_year TEXT,
  remarks TEXT,
  created_by TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`}</pre>
      </div>

      <ExamResultsManager initialResults={results} students={students} />
    </div>
  );
}
