import Link from "next/link";

// Home page shortcuts. Add/remove items here.
const links = [
  { title: "Admission", href: "/admission" },
  { title: "Apply Online", href: "/admission/apply" },
  { title: "Class Routine", href: "/academic/class-routine" },
  { title: "Notices", href: "/notices" },
  { title: "Student Login", href: "/login" },
];

export default function QuickLinks() {
  return (
    <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="rounded border p-4 text-center text-sm hover:bg-gray-50">
          {l.title}
        </Link>
      ))}
    </section>
  );
}
