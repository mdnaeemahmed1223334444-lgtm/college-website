import { redirect } from "next/navigation";
import { getAuthenticatedStudent } from "@/features/students/auth";

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
        <InfoRow label="RFID Card ID" value={student.rfid_card_id} />
      </Section>

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
