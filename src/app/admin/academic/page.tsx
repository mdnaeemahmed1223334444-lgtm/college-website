import Link from "next/link";

export const metadata = {
  title: "Academic Management | Administration",
};

const ACADEMIC_MODULES = [
  {
    title: "Class Routines",
    href: "/admin/academic/routines",
    icon: "📅",
    description: "Manage weekly class timetables for Science, Business Studies, and Humanities. Add, edit periods, and publish to students.",
    badge: "Active",
  },
  {
    title: "Subject Assignment",
    href: "/admin/staff/subjects",
    icon: "📖",
    description: "Assign faculty members to specific subjects, papers, and practical classes.",
    badge: "Configured",
  },
  {
    title: "Class & Section Allocation",
    href: "/admin/staff/class-section",
    icon: "🏫",
    description: "Assign Class Teachers (Mentors) and allocate subject teachers to academic sections.",
    badge: "Configured",
  },
  {
    title: "Manage Subjects",
    href: "/admin/academic/subjects",
    icon: "📚",
    description: "Create and manage academic subjects, paper codes, and credit hours across all departments.",
  },
  {
    title: "Academic Calendar",
    href: "/admin/academic/calendar",
    icon: "🗓️",
    description: "Configure academic sessions, semester terms, and examination schedules.",
  },
  {
    title: "Academic Rules",
    href: "/admin/academic/rules",
    icon: "📜",
    description: "Configure minimum attendance percentage, promotion criteria, and student regulations.",
  },
];

export default function AcademicManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure weekly class routines, course subjects, teacher assignments, and academic schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMIC_MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{mod.icon}</span>
                {mod.badge && (
                  <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
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
