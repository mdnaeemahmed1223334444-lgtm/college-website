import Link from "next/link";

export default function AcademicPrograms() {
  const programs = [
    {
      title: "Science",
      icon: "🔬",
      description:
        "Develop analytical thinking, scientific inquiry, and laboratory research skills across Physics, Chemistry, Biology, and Higher Mathematics.",
      href: "/academic/courses#science",
      delayClass: "reveal-delay-1",
    },
    {
      title: "Business Studies",
      icon: "📊",
      description:
        "Build a strong foundation in Accounting, Finance, Management, and modern Economics to thrive in commerce and entrepreneurship.",
      href: "/academic/courses#business-studies",
      delayClass: "reveal-delay-2",
    },
    {
      title: "Humanities",
      icon: "🌍",
      description:
        "Explore civic systems, history, language, philosophy, and social sciences that shape progressive thought and global perspective.",
      href: "/academic/courses#humanities",
      delayClass: "reveal-delay-3",
    },
  ];

  return (
    <section className="section academics" id="academics">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Heading */}
        <div className="section-heading reveal">
          <span className="eyebrow">Academic Excellence</span>
          <h2 className="section-title text-white">Explore Our Academic Programs</h2>
          <p className="section-description text-[#aeb8c4]">
            Comprehensive higher secondary curricula designed to challenge, inspire, and prepare
            students for world-class university entrance.
          </p>
          <div className="gold-line" />
        </div>

        {/* Academic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 academic-grid">
          {programs.map((prog) => (
            <div key={prog.title} className={`academic-card reveal ${prog.delayClass}`}>
              <div className="academic-icon">{prog.icon}</div>
              <h3>{prog.title}</h3>
              <p>{prog.description}</p>
              <Link href={prog.href} className="explore-link">
                EXPLORE PROGRAM ↗
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
