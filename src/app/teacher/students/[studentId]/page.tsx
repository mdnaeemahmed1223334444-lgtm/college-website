import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/current-user";
import { getStudentById } from "@/features/students/queries";

interface Props {
  params: Promise<{ studentId: string }>;
}

export const metadata = {
  title: "Student Profile - Teacher Portal",
  description: "Read-only institutional view of student academic, personal, and family records.",
};

export default async function TeacherStudentDetailPage({ params }: Props) {
  await requireRole(["teacher", "admin"]);
  const { studentId } = await params;
  const student = await getStudentById(studentId);

  if (!student) {
    notFound();
  }

  const groupLabel =
    student.study_group === "science"
      ? "Science"
      : student.study_group === "business_studies"
      ? "Business Studies"
      : "Humanities";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/teacher" className="hover:underline">
          Teacher Portal
        </Link>
        <span>&rsaquo;</span>
        <Link href="/teacher/students" className="hover:underline">
          Student Information
        </Link>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-900">{student.full_name}</span>
      </div>

      {/* Teacher Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-base">👀</span>
          <span>
            <strong>Teacher View (Read-Only):</strong> Official academic and guardian records for classroom management. Profile modifications are handled by the administrative registrar.
          </span>
        </div>
        <Link
          href="/teacher/students"
          className="rounded-lg bg-white border border-blue-300 px-3 py-1 font-semibold text-blue-700 hover:bg-blue-100 transition shrink-0 ml-3 shadow-2xs"
        >
          ← Back
        </Link>
      </div>

      {/* Student Identity Card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-gray-100 bg-gray-50 shadow-sm">
            {student.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-3xl font-bold text-blue-700">
                {student.full_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">{student.full_name}</h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 uppercase">
                ● {student.status}
              </span>
            </div>

            {student.bangla_name && (
              <p className="text-sm font-medium text-gray-500">{student.bangla_name}</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-gray-600">
              <span className="font-mono font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                ID: {student.student_code}
              </span>
              <span>&bull;</span>
              <span className="font-bold text-gray-900">Roll: #{student.roll}</span>
              <span>&bull;</span>
              <span className="font-semibold text-blue-700">{student.batch_name}</span>
              <span>&bull;</span>
              <span className="font-semibold text-indigo-700">{groupLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Academic & Placement */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
            <span>🎓</span>
            <span>Academic Enrollment</span>
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-gray-400 font-medium">HSC Batch</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{student.batch_name}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Study Stream</dt>
              <dd className="font-semibold text-blue-700 mt-0.5">{groupLabel}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Class Roll</dt>
              <dd className="font-bold text-gray-900 mt-0.5">#{student.roll}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Status</dt>
              <dd className="font-semibold text-emerald-700 mt-0.5 capitalize">{student.status}</dd>
            </div>
            {student.rfid_card_id && (
              <div className="col-span-2">
                <dt className="text-gray-400 font-medium">Hardware RFID Tag</dt>
                <dd className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block mt-0.5">
                  {student.rfid_card_id}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Contact & Personal */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
            <span>📱</span>
            <span>Contact & Personal</span>
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-gray-400 font-medium">Personal Phone</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{student.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Blood Group</dt>
              <dd className="font-bold text-red-700 mt-0.5">{student.blood_group || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Gender</dt>
              <dd className="font-semibold text-gray-900 mt-0.5 capitalize">{student.gender}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Religion</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{student.religion || "Islam"}</dd>
            </div>
            <div>
              <dt className="text-gray-400 font-medium">Date of Birth</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{student.date_of_birth || "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-400 font-medium">Email Address</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{student.email || "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-400 font-medium">Present Living Address</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{student.address || "—"}</dd>
            </div>
            {student.permanent_address && (
              <div className="col-span-2">
                <dt className="text-gray-400 font-medium">Permanent Address</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{student.permanent_address}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Parents & Family Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs space-y-4 sm:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-1.5">
            <span>👨‍👩‍👧</span>
            <span>Family & Guardian Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Father */}
            <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Father</div>
              {student.father_name ? (
                <>
                  <div className="font-bold text-gray-900 text-xs">{student.father_name}</div>
                  <div className="text-xs text-gray-600 font-medium">{student.father_phone || "No phone listed"}</div>
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">Deceased / Not on record</div>
              )}
            </div>

            {/* Mother */}
            <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-gray-400 uppercase">Mother</div>
              {student.mother_name ? (
                <>
                  <div className="font-bold text-gray-900 text-xs">{student.mother_name}</div>
                  <div className="text-xs text-gray-600 font-medium">{student.mother_phone || "No phone listed"}</div>
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">Deceased / Not on record</div>
              )}
            </div>

            {/* Primary / Legal Guardian */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3.5 space-y-1">
              <div className="text-[11px] font-bold text-blue-900 uppercase">
                Primary Guardian ({student.guardian_relation || "Legal Guardian"})
              </div>
              <div className="font-bold text-gray-900 text-xs">{student.guardian_name || "—"}</div>
              <div className="text-xs text-blue-800 font-semibold">{student.guardian_phone || "—"}</div>
            </div>
          </div>

          {student.notes && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
              <span className="font-bold">Faculty Notes:</span> {student.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
