import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { privateAdmin } from "@/lib/supabase/private-server";

export const metadata = {
  title: "My Profile - Student Portal",
  description: "View academic status, identity details, and personal information.",
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-bold uppercase tracking-wider text-gray-500 sm:w-44 flex-shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 font-medium">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</h2>
      </div>
      <dl className="px-5 py-1">{children}</dl>
    </div>
  );
}

const studyGroupLabel: Record<string, string> = {
  science: "Science",
  business_studies: "Business Studies",
  humanities: "Humanities",
};

export default async function StudentProfilePage() {
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
      if (data) results = data;
    } catch {
      // ignore
    }
  }

  // Group by exam_name
  const byExam = new Map<string, any[]>();
  for (const r of results) {
    const key = r.exam_name || "General Examination";
    if (!byExam.has(key)) byExam.set(key, []);
    byExam.get(key)!.push(r);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your enrolled batch, academic details, and personal information.
        </p>
      </div>

      {/* Identity Card */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {student.photo_url ? (
            <img
              src={student.photo_url}
              alt={student.full_name}
              className="h-24 w-24 rounded-xl object-cover ring-4 ring-white/30 shadow-lg flex-shrink-0"
            />
          ) : (
            <div className="h-24 w-24 rounded-xl bg-white/20 ring-4 ring-white/30 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-4xl font-black">{student.full_name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-black">{student.full_name}</h2>
            {student.bangla_name && <p className="text-blue-200">{student.bangla_name}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-white/15 rounded-full px-3 py-1">🪪 {student.student_code}</span>
              <span className="bg-white/15 rounded-full px-3 py-1">📚 {student.batch_name}</span>
              {student.study_group && (
                <span className="bg-white/15 rounded-full px-3 py-1">
                  {studyGroupLabel[student.study_group] || student.study_group}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 ${
                  student.status === "active"
                    ? "bg-emerald-400/30 text-emerald-100"
                    : "bg-red-400/30 text-red-100"
                }`}
              >
                {student.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <Section title="Academic Information">
        <InfoRow label="Student ID" value={student.student_code} />
        <InfoRow label="Batch" value={student.batch_name} />
        <InfoRow label="Group / Stream" value={studyGroupLabel[student.study_group || ""] || student.study_group} />
        <InfoRow label="Roll Number" value={student.roll} />
        <InfoRow label="Section" value={student.section} />
        <InfoRow label="Academic Session" value={student.academic_session} />
        <InfoRow label="Registration No." value={student.registration_number} />
        <InfoRow label="Previous Institution" value={student.previous_institution} />
        <InfoRow
          label="Admission Date"
          value={
            student.admission_date
              ? new Date(student.admission_date).toLocaleDateString("en-GB")
              : undefined
          }
        />
        <InfoRow label="Smart ID Card Number" value={student.rfid_card_id} />
      </Section>

      {/* Examination Results */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">🏆 Examination Results</h2>
          <Link href="/student/results" className="text-xs font-bold text-blue-700 hover:text-blue-900">
            View Full Marksheet →
          </Link>
        </div>
        <div className="p-5">
          {results.length === 0 ? (
            <p className="text-xs text-gray-500">No published examination results yet.</p>
          ) : (
            <div className="space-y-3">
              {Array.from(byExam.entries()).map(([exam, items]) => {
                const totalObtained = items.reduce((acc, c) => acc + (Number(c.obtained_marks) || 0), 0);
                const totalPossible = items.reduce((acc, c) => acc + (Number(c.total_marks) || 100), 0);
                const validGpa = items.filter((i) => i.gpa != null);
                const avgGpa = validGpa.length > 0 ? (validGpa.reduce((acc, c) => acc + Number(c.gpa), 0) / validGpa.length).toFixed(2) : null;
                return (
                  <div key={exam} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{exam}</p>
                      <p className="text-xs text-gray-500">{items.length} Subjects Evaluated</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                        Score: {totalObtained} / {totalPossible}
                      </span>
                      {avgGpa && (
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          GPA: {avgGpa}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information">
        <InfoRow label="Full Name" value={student.full_name} />
        <InfoRow label="Bangla Name" value={student.bangla_name} />
        <InfoRow label="Gender" value={student.gender} />
        <InfoRow label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString("en-GB") : undefined} />
        <InfoRow label="Blood Group" value={student.blood_group} />
        <InfoRow label="Religion" value={student.religion} />
        <InfoRow label="Phone" value={student.phone} />
        <InfoRow label="Email" value={student.email} />
        <InfoRow label="Present Address" value={student.address} />
        <InfoRow label="Permanent Address" value={student.permanent_address} />
      </Section>

      {/* Guardian Info */}
      <Section title="Family & Guardian">
        <InfoRow label="Father's Name" value={student.father_name} />
        <InfoRow label="Father's Phone" value={student.father_phone} />
        <InfoRow label="Mother's Name" value={student.mother_name} />
        <InfoRow label="Mother's Phone" value={student.mother_phone} />
        <InfoRow label="Guardian Name" value={student.guardian_name} />
        <InfoRow label="Guardian Phone" value={student.guardian_phone} />
        <InfoRow label="Guardian Relation" value={student.guardian_relation} />
      </Section>
    </div>
  );
}
