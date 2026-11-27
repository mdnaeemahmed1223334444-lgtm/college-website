import Link from "next/link";

const links = [
  { title: "Admission",      href: "/admission",             icon: "🎓", color: "from-blue-500 to-blue-700" },
  { title: "Apply Online",   href: "/admission/apply",       icon: "📝", color: "from-indigo-500 to-indigo-700" },
  { title: "Class Routine",  href: "/academic/class-routine", icon: "📅", color: "from-teal-500 to-teal-700" },
  { title: "Notices",        href: "/notices",               icon: "📢", color: "from-amber-500 to-amber-600" },
  { title: "Student Portal", href: "/student/dashboard",      icon: "🔐", color: "from-purple-500 to-purple-700" },
];

export default function QuickLinks() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {links.map((l, i) => (
        <Link
          key={l.href}
          href={l.href}
          className={`animate-fadeInUp group relative overflow-hidden rounded-2xl bg-gradient-to-br ${l.color} p-4 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-100`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* Shine overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-2xl" />
          {/* Decorative circle */}
          <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col items-start gap-1.5">
            <span className="text-2xl sm:text-3xl drop-shadow">{l.icon}</span>
            <span className="text-xs sm:text-sm font-bold leading-tight">{l.title}</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
