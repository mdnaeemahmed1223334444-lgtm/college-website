import DynamicContentPage from "@/components/shared/DynamicContentPage";

export default function ManagementCommitteePage() {
  return (
    <DynamicContentPage
      slug="about/management-committee"
      fallbackTitle="Management Committee"
      category="about"
    />
  );
}
