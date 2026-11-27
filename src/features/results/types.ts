export interface ExamResult {
  id: string;
  student_id: string;
  batch_id?: string | null;
  exam_name: string;
  subject: string;
  total_marks: number;
  obtained_marks: number | null;
  grade: string | null;
  gpa: number | null;
  exam_date: string | null;
  academic_year: string | null;
  remarks: string | null;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamResultInput {
  student_id: string;
  batch_id?: string | null;
  exam_name: string;
  subject: string;
  total_marks: number;
  obtained_marks: number | null;
  grade?: string | null;
  gpa?: number | null;
  exam_date?: string | null;
  academic_year?: string | null;
  remarks?: string | null;
  is_published?: boolean;
}

/** Grade thresholds for HSC Bangladesh grading system */
export function computeGrade(obtained: number, total: number): { grade: string; gpa: number } {
  const pct = total > 0 ? (obtained / total) * 100 : 0;
  if (pct >= 80) return { grade: "A+", gpa: 5.0 };
  if (pct >= 70) return { grade: "A", gpa: 4.0 };
  if (pct >= 60) return { grade: "A-", gpa: 3.5 };
  if (pct >= 50) return { grade: "B", gpa: 3.0 };
  if (pct >= 40) return { grade: "C", gpa: 2.0 };
  if (pct >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
}
