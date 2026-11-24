import Link from "next/link";

export default function AboutSection() {
  const points = [
    "Dedicated Faculty",
    "Modern Laboratories",
    "Student Development",
    "Academic Excellence",
  ];

  return (
    <section className="section" id="about">
      <div className="max-w-7xl mx-auto px-4 about-grid">
        {/* Left: Overlapping Photos & Floating Badge */}
        <div className="about-images reveal-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-main-img"
            src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1000&q=85"
            alt="Dhaka Model College Campus"
          />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-small-img"
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=85"
            alt="Students collaborating"
          />

          <div className="about-badge">
            <strong>28+</strong>
            <small>Years of Legacy</small>
          </div>
        </div>

        {/* Right: Text Content */}
        <div className="about-text reveal-right">
          <div className="section-heading">
            <span className="eyebrow">About Our Institution</span>
            <h2 className="section-title">Shaping Tomorrow&apos;s Leaders Today</h2>
            <div className="gold-line" />
          </div>

          <p className="text-[#7b8490] text-sm leading-[1.9] mb-5">
            At Dhaka Model College, we believe every student has the potential to achieve
            something extraordinary. Our institution provides an environment where curiosity is
            encouraged, discipline is cultivated, and knowledge is valued above all.
          </p>

          <p className="text-[#7b8490] text-sm leading-[1.9] mb-7">
            Through dedicated educators, modern multimedia classrooms, advanced science and computer
            labs, and a vibrant co-curricular culture, we guide students to become confident,
            responsible, and accomplished leaders of the nation.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-9 about-points">
            {points.map((point) => (
              <div key={point} className="about-point">
                <span>✦</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          <Link href="/about/overview" className="btn btn-primary">
            DISCOVER OUR STORY ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
