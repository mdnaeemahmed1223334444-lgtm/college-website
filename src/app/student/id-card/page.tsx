import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedStudent } from "@/features/students/auth";
import { getBrandingSettings } from "@/features/website/queries";

export const metadata = {
  title: "Digital Student ID Card | Student Portal",
  description: "Official digital identity card with student details and campus entry credentials.",
};

export default async function StudentIdCardPage() {
  const student = await getAuthenticatedStudent();
  if (!student) redirect("/student/login");

  const branding = await getBrandingSettings();

  const studyGroupLabel: Record<string, string> = {
    science: "Science",
    business_studies: "Business Studies",
    humanities: "Humanities",
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Digital Student ID Card</h1>
          <p className="text-sm text-gray-500 mt-1">
            Official college digital identity credential and campus entry pass.
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs self-start"
        >
          ← Dashboard
        </Link>
      </div>

      {/* ID Card Outer (Front) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-blue-900 bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl p-6 sm:p-8">
        {/* Subtle Watermark Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <span className="text-[120px] font-black uppercase">COLLEGE</span>
        </div>

        {/* Top Header */}
        <div className="flex items-center gap-4 border-b border-white/20 pb-4">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt="College Logo"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40 bg-white"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/10 ring-2 ring-white/40 flex items-center justify-center text-xl font-black">
              {branding.shortName?.slice(0, 2) || "DC"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-tight text-white truncate">
              {branding.collegeName}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              EIIN: {branding.eiin || "134250"} • College Code: {branding.collegeCode || "1082"}
            </p>
            <span className="inline-block mt-1 rounded bg-amber-400/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-950">
              STUDENT IDENTITY CARD
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Photo */}
          <div className="flex-shrink-0 text-center">
            {student.photo_url ? (
              <img
                src={student.photo_url}
                alt={student.full_name}
                className="h-32 w-28 rounded-xl object-cover ring-4 ring-white/30 shadow-md bg-gray-100"
              />
            ) : (
              <div className="h-32 w-28 rounded-xl bg-white/10 ring-4 ring-white/30 flex items-center justify-center shadow-md">
                <span className="text-4xl font-black text-white/70">
                  {student.full_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="mt-2">
              <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase">
                {student.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 text-xs sm:text-sm w-full">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Student Name
              </div>
              <div className="text-base sm:text-lg font-black text-white leading-tight">
                {student.full_name}
              </div>
              {student.bangla_name && (
                <div className="text-xs text-blue-200 font-medium">{student.bangla_name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                  Student ID
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {student.student_code}
                </span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                  Roll Number
                </span>
                <span className="font-bold text-white text-sm">#{student.roll}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                  Batch / Year
                </span>
                <span className="font-bold text-white">{student.batch_name}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                  Group / Stream
                </span>
                <span className="font-bold text-white">
                  {studyGroupLabel[student.study_group] || student.study_group}
                </span>
              </div>
              {student.blood_group && (
                <div>
                  <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                    Blood Group
                  </span>
                  <span className="font-bold text-rose-300">{student.blood_group}</span>
                </div>
              )}
              {student.phone && (
                <div>
                  <span className="text-blue-300 font-semibold block text-[10px] uppercase">
                    Contact Phone
                  </span>
                  <span className="font-mono text-white text-[11px]">{student.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Smart Card Key */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] text-blue-200">
          <div className="flex items-center gap-2">
            <span>🪪 Smart Card ID:</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
              {student.rfid_card_id || "GATE-PASS REGISTERED"}
            </span>
          </div>
          <div className="font-mono text-[10px] text-blue-300 tracking-widest sm:text-right">
            VALID SESSION: {student.academic_session || "2025-2026"}
          </div>
        </div>
      </div>

      {/* Helpful Instructions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-xs text-gray-600 space-y-2">
        <h3 className="font-bold text-sm text-gray-900">ID Card Guidelines</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Carry this ID card or digital copy during college hours and examinations.</li>
          <li>Tap your registered smart ID card at Gate 01 for automated attendance logging.</li>
          <li>For lost cards or information corrections, please contact the College Registrar.</li>
        </ul>
      </div>
    </div>
  );
}
