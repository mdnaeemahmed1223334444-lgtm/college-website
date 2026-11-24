export default function IntroStrip() {
  const items = [
    { title: "Knowledge", subtitle: "Building a stronger tomorrow" },
    { title: "Character", subtitle: "Growing with integrity" },
    { title: "Excellence", subtitle: "Inspiring lifelong learning" },
  ];

  return (
    <section className="intro-strip">
      <div className="max-w-7xl mx-auto px-4 intro-grid">
        {items.map((item) => (
          <div key={item.title} className="intro-item">
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
