import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function RegulationsPage() {
  return (
    <DynamicContentPage
      slug="academic/regulations"
      fallbackTitle="Academic Rules & Regulations"
      category="academic"
    />
  );
}
