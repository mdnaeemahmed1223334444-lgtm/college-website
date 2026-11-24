import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function AboutPage() {
  return (
    <DynamicContentPage
      slug="about/overview"
      fallbackTitle="About Our College"
      category="about"
    />
  );
}
