import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function OverviewPage() {
  return (
    <DynamicContentPage
      slug="about/overview"
      fallbackTitle="College Overview"
      category="about"
    />
  );
}
