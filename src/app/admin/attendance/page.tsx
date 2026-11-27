import Link from "next/link";

export const metadata = {
  title: "Attendance Management | Administration",
};

const ATTENDANCE_MODULES = [
  {
    title: "Attendance Rules & Time Settings",
    href: "/admin/attendance/rules",
    icon: "⚙️",
    description: "Edit student RFID check-in arrival time (09:00 AM), departure time (01:30 PM / 02:10 PM), late grace periods, and weekly off days.",
    badge: "Time Rules",
  },
  {
    title: "View All Attendance",
    href: "/admin/attendance/all",
    icon: "🪪",
    description: "Real-time RFID gate scanner logs, check-in timestamps, and departure records.",
    badge: "Live Scans",
  },
  {
    title: "Student Attendance",
    href: "/admin/attendance/students",
    icon: "🎓",
    description: "Daily and monthly attendance ledger filtered by Batch and Study Group.",
  },
  {
    title: "Staff Attendance",
    href: "/admin/attendance/staff",
    icon: "👨‍🏫",
    description: "Daily faculty check-ins and teacher biometric attendance.",
  },
  {
    title: "Attendance Reports",
    href: "/admin/attendance/reports",
    icon: "📊",
    description: "Generate attendance summary reports, low-attendance warnings (<75%), and export to CSV/PDF.",
  },
  {
    title: "Attendance Correction",
    href: "/admin/attendance/correction",
    icon: "✏️",
    description: "Manually adjust or approve attendance records with administrative remarks.",
  },
];

export default function AttendanceManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendance Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor RFID gate scans, configure check-in / check-out times, and view daily attendance statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ATTENDANCE_MODULES.map((mod) => (
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
