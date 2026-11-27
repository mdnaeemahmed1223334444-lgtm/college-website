import "server-only";
import { privateAdmin } from "@/lib/supabase/private-server";
import type { ExamResult } from "./types";

export async function getStudentResults(studentId: string): Promise<ExamResult[]> {
  const supabase = privateAdmin();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("exam_results")
      .select("*")
      .eq("student_id", studentId)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data || []) as ExamResult[];
  } catch {
    return [];
  }
}

export async function getAllResultsAdmin(filters?: {
  studentId?: string;
  examName?: string;
  batchId?: string;
}): Promise<ExamResult[]> {
  const supabase = privateAdmin();
  if (!supabase) return [];
  try {
    let query = supabase
      .from("exam_results")
      .select("*, students:student_id(id, full_name, student_code, batch_id, study_group)")
      .order("created_at", { ascending: false });

    if (filters?.studentId) query = query.eq("student_id", filters.studentId);
    if (filters?.examName) query = query.eq("exam_name", filters.examName);
    if (filters?.batchId) query = query.eq("batch_id", filters.batchId);

    const { data } = await query;
    return (data || []) as ExamResult[];
  } catch {
    return [];
  }
}

export async function getExamNames(): Promise<string[]> {
  const supabase = privateAdmin();
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("exam_results")
      .select("exam_name")
      .order("exam_name");
    if (!data) return [];
    return [...new Set(data.map((r: any) => r.exam_name))];
  } catch {
    return [];
  }
}
