import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function AcademicPage() {
  return (
    <DynamicContentPage
      slug="academic/regulations"
      fallbackTitle="Academic Regulations & Code of Conduct"
      category="academic"
    />
  );
}
