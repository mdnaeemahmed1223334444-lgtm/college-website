import PlaceholderPage from "@/components/shared/PlaceholderPage";

// Admin view of ONE student: edit EVERYTHING.
export default async function AdminStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return (
    <PlaceholderPage
      href={`/admin/students/${studentId}`}
      title="Edit Student"
      backHref="/admin/students/list"
      backLabel="All Students"
      sections={[
        "Edit all details (personal, guardian, contact, photo)",
        "Change batch / group (Science, Business Studies, Humanities) -> logged in history",
        "Change status (active / suspended / dropped / passed out)",
        "Documents, account (login), attendance, results, fees",
        "Transfer history",
      ]}
    />
  );
}
