import Link from "next/link";

export const metadata = {
  title: "Examination Management | Administration",
};

const EXAM_MODULES = [
  {
    title: "Marks & Results Management",
    href: "/admin/examinations/marks",
    icon: "🏆",
    description: "Enter and edit student exam marks, calculate GPAs/grades automatically, and publish directly to individual student profiles.",
    badge: "Active",
  },
  {
    title: "Create Examinations",
    href: "/admin/examinations/create",
    icon: "📝",
    description: "Setup new academic terms, pre-board exams, term-finals, and test examinations.",
  },
  {
    title: "Exam Schedule",
    href: "/admin/examinations/schedule",
    icon: "📅",
    description: "Publish examination routines, date sheets, subject timings, and exam instructions.",
  },
  {
    title: "Grading System",
    href: "/admin/examinations/grading",
    icon: "📊",
    description: "HSC Board GPA scale (5.0, 4.0, 3.5, 3.0, 2.0, 1.0, 0.0) and grade boundaries.",
  },
  {
    title: "Publish Results",
    href: "/admin/examinations/publish",
    icon: "📢",
    description: "Batch publish finalized exam results to make them visible on student portals.",
  },
  {
    title: "Result History",
    href: "/admin/examinations/history",
    icon: "📜",
    description: "Historical academic archive of all past examinations and student transcripts.",
  },
];

export default function ExaminationManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Examination Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage term examinations, student marks entry, grade calculation, and portal publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXAM_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{mod.icon}</span>
                {mod.badge && (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    {mod.badge}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {mod.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {mod.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              Open Module →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
