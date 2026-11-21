import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function PrincipalsMessagePage() {
  return (
    <DynamicContentPage
      slug="about/principals-message"
      fallbackTitle="Principal's Message"
      category="about"
    />
  );
}
