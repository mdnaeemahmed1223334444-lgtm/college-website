import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function AboutPage() {
  return (
    <DynamicContentPage
      slug="about/overview"
      fallbackTitle="About Dhaka Model College"
      category="about"
    />
  );
}
