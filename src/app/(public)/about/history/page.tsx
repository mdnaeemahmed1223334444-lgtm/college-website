import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function HistoryPage() {
  return (
    <DynamicContentPage
      slug="about/history"
      fallbackTitle="College History"
      category="about"
    />
  );
}
