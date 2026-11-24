"use client";

export default function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className="back-top"
      id="backTop"
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
